import { 
  uploadTerraform,
  getUsageAssumption,
  getClarifyQuestions,
  generateUsage,
  askCopilot
} from '../api';

// Mock fetch API
global.fetch = jest.fn();

// Mock response data
const mockFile = new File(['test content'], 'test.zip', { type: 'application/zip' });
const mockResource = { name: 'test_resource', resource_type: 'aws_instance' };
const mockResources = [mockResource];

describe('API Service', () => {
  beforeEach(() => {
    // Clear mock data before each test
    fetch.mockClear();
  });

  // Helper to mock successful response
  const mockSuccessResponse = (data) => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data)
    });
  };

  // Helper to mock error response
  const mockErrorResponse = (status, error) => {
    return Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error })
    });
  };

  describe('uploadTerraform', () => {
    test('calls the upload endpoint with correct data', async () => {
      // Mock response
      const mockData = { uid: 'test-uid', cost_breakdown: [] };
      fetch.mockReturnValueOnce(mockSuccessResponse(mockData));

      // Call the function
      const result = await uploadTerraform(mockFile);

      // Assertions
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/upload'), {
        method: 'POST',
        body: expect.any(FormData)
      });
      expect(result).toEqual(mockData);
    });

    test('throws error on API failure', async () => {
      // Mock error response
      fetch.mockReturnValueOnce(mockErrorResponse(500, 'Server error'));

      // Call the function and expect it to throw
      await expect(uploadTerraform(mockFile)).rejects.toThrow('Server error');
    });
  });

  describe('getUsageAssumption', () => {
    test('calls the suggest-usage endpoint with correct data', async () => {
      // Mock response
      const mockData = { suggested_usage: 80 };
      fetch.mockReturnValueOnce(mockSuccessResponse(mockData));

      // Call the function
      const result = await getUsageAssumption(mockResource);

      // Assertions
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/suggest-usage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: mockResource, llm: 'gemini' })
      });
      expect(result).toBe(80);
    });

    test('returns default value when API returns no suggestion', async () => {
      // Mock response with no suggested_usage
      fetch.mockReturnValueOnce(mockSuccessResponse({}));

      // Call the function
      const result = await getUsageAssumption(mockResource);

      // Should return the default value
      expect(result).toBe(100);
    });
  });

  describe('getClarifyQuestions', () => {
    test('calls the usage-clarify endpoint with correct data', async () => {
      // Mock questions
      const mockQuestions = [
        { resource_name: 'test', question: 'Question 1?' }
      ];
      fetch.mockReturnValueOnce(mockSuccessResponse({ questions: mockQuestions }));

      // Call the function
      const result = await getClarifyQuestions(mockResources);

      // Assertions
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/usage-clarify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resources: mockResources })
      });
      expect(result).toEqual(mockQuestions);
    });

    test('returns empty array when API returns no questions', async () => {
      // Mock response with no questions
      fetch.mockReturnValueOnce(mockSuccessResponse({}));

      // Call the function
      const result = await getClarifyQuestions(mockResources);

      // Should return empty array
      expect(result).toEqual([]);
    });
  });

  describe('generateUsage', () => {
    test('calls the usage-generate endpoint with correct data', async () => {
      // Mock answers
      const mockAnswers = [{ resource_name: 'test', answer: 'Answer 1' }];
      // Mock usage data
      const mockUsage = { test_resource: { monthly_hours: 720 } };
      fetch.mockReturnValueOnce(mockSuccessResponse({ usage: mockUsage }));

      // Call the function
      const result = await generateUsage(mockResources, mockAnswers);

      // Assertions
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/usage-generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resources: mockResources, answers: mockAnswers })
      });
      expect(result).toEqual(mockUsage);
    });

    test('returns empty object when API returns no usage data', async () => {
      // Mock response with no usage data
      fetch.mockReturnValueOnce(mockSuccessResponse({}));

      // Call the function
      const result = await generateUsage(mockResources, []);

      // Should return empty object
      expect(result).toEqual({});
    });
  });

  describe('askCopilot', () => {
    test('calls the copilot endpoint with correct data', async () => {
      // Mock response
      const mockAnswer = 'This is the answer';
      fetch.mockReturnValueOnce(mockSuccessResponse({ answer: mockAnswer }));

      // Call the function
      const result = await askCopilot('What is my cost?', mockResources);

      // Assertions
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/copilot'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'What is my cost?', resources: mockResources })
      });
      expect(result).toBe(mockAnswer);
    });

    test('returns default message when API returns no answer', async () => {
      // Mock response with no answer
      fetch.mockReturnValueOnce(mockSuccessResponse({}));

      // Call the function
      const result = await askCopilot('What is my cost?', mockResources);

      // Should return default message
      expect(result).toBe('Sorry, I could not answer that question.');
    });
  });
});