import { renderHook, act } from '@testing-library/react-hooks';
import { useResources } from '../useResources';
import { uploadTerraform, getUsageAssumption } from '../../services/api';

// Mock the API functions
jest.mock('../../services/api', () => ({
  uploadTerraform: jest.fn(),
  getUsageAssumption: jest.fn(),
}));

describe('useResources hook', () => {
  const mockFile = new File(['test content'], 'test.zip', { type: 'application/zip' });
  const mockResources = [
    { name: 'resource1', resource_type: 'aws_instance', monthlyCost: '10.00', index: 0 },
    { name: 'resource2', resource_type: 'aws_lambda_function', monthlyCost: '5.25', index: 1 },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('initial state is empty', () => {
    const { result } = renderHook(() => useResources());
    
    expect(result.current.file).toBeNull();
    expect(result.current.resources).toEqual([]);
    expect(result.current.adjustments).toEqual({});
    expect(result.current.totalCost).toBe('0.00');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  test('handleFileChange updates file state', () => {
    const { result } = renderHook(() => useResources());
    
    act(() => {
      result.current.handleFileChange({ target: { files: [mockFile] } });
    });
    
    expect(result.current.file).toBe(mockFile);
  });
  
  test('handleUpload fails when no file is selected', async () => {
    const { result } = renderHook(() => useResources());
    
    await act(async () => {
      await result.current.handleUpload();
    });
    
    expect(result.current.error).toBe('Please select a file first');
    expect(uploadTerraform).not.toHaveBeenCalled();
  });
  
  test('handleUpload processes file successfully', async () => {
    // Mock API responses
    uploadTerraform.mockResolvedValue({
      uid: 'test-uid',
      cost_breakdown: mockResources,
    });
    getUsageAssumption.mockResolvedValueOnce(80);
    getUsageAssumption.mockResolvedValueOnce(50);
    
    const { result } = renderHook(() => useResources());
    
    // Set file
    act(() => {
      result.current.handleFileChange({ target: { files: [mockFile] } });
    });
    
    // Upload file
    await act(async () => {
      await result.current.handleUpload();
    });
    
    // Check state
    expect(result.current.resources).toEqual(mockResources);
    expect(result.current.projectId).toBe('test-uid');
    expect(result.current.adjustments).toEqual({ 0: 80, 1: 50 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Check API calls
    expect(uploadTerraform).toHaveBeenCalledWith(mockFile);
    expect(getUsageAssumption).toHaveBeenCalledTimes(2);
    expect(getUsageAssumption).toHaveBeenCalledWith(mockResources[0]);
    expect(getUsageAssumption).toHaveBeenCalledWith(mockResources[1]);
  });
  
  test('handleUpload handles API error', async () => {
    // Mock API error
    uploadTerraform.mockRejectedValue(new Error('API error'));
    
    const { result } = renderHook(() => useResources());
    
    // Set file
    act(() => {
      result.current.handleFileChange({ target: { files: [mockFile] } });
    });
    
    // Upload file
    await act(async () => {
      await result.current.handleUpload();
    });
    
    // Check state
    expect(result.current.resources).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('API error');
  });
  
  test('updateAdjustment updates a single adjustment', () => {
    const { result } = renderHook(() => useResources());
    
    // Initialize with some resources and adjustments
    act(() => {
      result.current.resources = mockResources;
      result.current.adjustments = { 0: 80, 1: 50 };
    });
    
    // Update adjustment
    act(() => {
      result.current.updateAdjustment(1, 75);
    });
    
    // Check state
    expect(result.current.adjustments).toEqual({ 0: 80, 1: 75 });
  });
  
  test('applyUsageData converts usage to adjustments', () => {
    const { result } = renderHook(() => useResources());
    
    // Initialize with some resources
    act(() => {
      result.current.resources = mockResources;
    });
    
    // Apply usage data
    act(() => {
      result.current.applyUsageData({
        resource1: { monthly_hours: 360 }, // 50% of 720 hours
        resource2: { monthly_requests: 500000 }, // 50% of 1M requests
      });
    });
    
    // Check adjustments
    expect(result.current.adjustments[0]).toBe(50); // 360/7.2 = 50
    expect(result.current.adjustments[1]).toBe(50); // 500000/10000 = 50
  });
  
  test('totalCost is calculated correctly', () => {
    const { result } = renderHook(() => useResources());
    
    // Initialize with resources and adjustments
    act(() => {
      result.current.resources = mockResources;
      result.current.adjustments = { 0: 50, 1: 25 };
    });
    
    // Check total cost: (10.00 * 50/100) + (5.25 * 25/100) = 5.00 + 1.31 = 6.31
    expect(result.current.totalCost).toBe('6.31');
  });
  
  test('groupedResources organizes resources by type', () => {
    const { result } = renderHook(() => useResources());
    
    // Initialize with resources
    act(() => {
      result.current.resources = mockResources;
    });
    
    // Check grouped resources
    expect(Object.keys(result.current.groupedResources)).toEqual([
      'aws_instance',
      'aws_lambda_function',
    ]);
    expect(result.current.groupedResources['aws_instance']).toHaveLength(1);
    expect(result.current.groupedResources['aws_lambda_function']).toHaveLength(1);
  });
});
