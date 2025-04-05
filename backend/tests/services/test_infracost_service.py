import pytest
import json
import os
from pathlib import Path
from unittest.mock import patch, mock_open, MagicMock

from app.services.infracost_service import InfracostService

# Test fixtures
@pytest.fixture
def upload_dir():
    """Create a temporary directory for testing"""
    test_dir = Path('test_terraform_projects')
    test_dir.mkdir(exist_ok=True)
    yield test_dir
    # Cleanup - in real tests, use pytest tmp_path instead
    import shutil
    if test_dir.exists():
        shutil.rmtree(test_dir)

@pytest.fixture
def infracost_service(upload_dir):
    """Create an InfracostService instance for testing"""
    return InfracostService(upload_dir)

@pytest.fixture
def mock_infracost_output():
    """Sample Infracost output"""
    return {
        "projects": [
            {
                "breakdown": {
                    "resources": [
                        {
                            "name": "aws_instance.example",
                            "resource_type": "aws_instance",
                            "monthlyCost": "10.00"
                        },
                        {
                            "name": "aws_lambda_function.test",
                            "resource_type": "aws_lambda_function",
                            "monthlyCost": "5.25"
                        }
                    ]
                }
            }
        ]
    }

# Tests
def test_extract_resources(infracost_service, mock_infracost_output):
    """Test extracting resources from Infracost output"""
    resources = infracost_service._extract_resources(mock_infracost_output)
    
    assert len(resources) == 2
    assert resources[0]["name"] == "aws_instance.example"
    assert resources[0]["resource_type"] == "aws_instance"
    assert resources[0]["monthlyCost"] == "10.00"

def test_extract_resources_no_projects(infracost_service):
    """Test extracting resources with no projects"""
    with pytest.raises(ValueError, match="No projects found"):
        infracost_service._extract_resources({"projects": []})

def test_extract_resources_no_breakdown(infracost_service):
    """Test extracting resources with no breakdown"""
    with pytest.raises(ValueError, match="No cost breakdown found"):
        infracost_service._extract_resources({"projects": [{"breakdown": None}]})

@patch('zipfile.ZipFile')
def test_extract_zip(mock_zipfile, infracost_service):
    """Test extracting ZIP file"""
    mock_zip = MagicMock()
    mock_zip.namelist.return_value = ["main.tf", "variables.tf"]
    mock_zipfile.return_value.__enter__.return_value = mock_zip
    
    extract_path = Path("test_path")
    zip_path = Path("test.zip")
    
    infracost_service._extract_zip(zip_path, extract_path)
    
    mock_zipfile.assert_called_once_with(zip_path, 'r')
    mock_zip.extractall.assert_called_once_with(extract_path)
    
@patch('zipfile.ZipFile')
def test_extract_zip_with_estimate(mock_zipfile, infracost_service):
    """Test extracting ZIP file with estimate.json"""
    mock_zip = MagicMock()
    mock_zip.namelist.return_value = ["main.tf", "estimate.json"]
    mock_zipfile.return_value.__enter__.return_value = mock_zip
    
    extract_path = Path("test_path")
    zip_path = Path("test.zip")
    
    with patch('os.rename') as mock_rename:
        infracost_service._extract_zip(zip_path, extract_path)
        
        mock_zipfile.assert_called_once_with(zip_path, 'r')
        mock_zip.extractall.assert_called_once_with(extract_path)
        mock_zip.extract.assert_called_once_with('estimate.json', extract_path)
        mock_rename.assert_called_once_with(
            extract_path / 'estimate.json', 
            extract_path / 'previous_estimate.json'
        )

@patch('subprocess.check_output')
@patch('json.loads')
def test_process_terraform_file_zip(mock_json_loads, mock_subprocess, 
                                infracost_service, mock_infracost_output):
    """Test processing a ZIP file"""
    mock_json_loads.return_value = mock_infracost_output
    mock_subprocess.return_value = "output"
    
    file_path = Path("test.zip")
    extract_path = Path("extract_path")
    
    with patch.object(infracost_service, '_extract_zip') as mock_extract:
        with patch.object(infracost_service, '_save_estimate') as mock_save:
            resources, uid = infracost_service.process_terraform_file(file_path, extract_path)
            
            mock_extract.assert_called_once_with(file_path, extract_path)
            mock_subprocess.assert_called_once_with(
                ["infracost", "breakdown", "--path", str(extract_path), "--format", "json"]
            )
            mock_json_loads.assert_called_once_with("output")
            mock_save.assert_called_once()
            
            assert len(resources) == 2
            assert uid == extract_path.name

@patch('subprocess.check_output')
@patch('json.loads')
def test_process_terraform_file_plan(mock_json_loads, mock_subprocess, 
                                 infracost_service, mock_infracost_output):
    """Test processing a plan file"""
    mock_json_loads.return_value = mock_infracost_output
    mock_subprocess.return_value = "output"
    
    file_path = Path("test.json")
    extract_path = Path("extract_path")
    
    with patch.object(infracost_service, '_save_estimate') as mock_save:
        resources, uid = infracost_service.process_terraform_file(file_path, extract_path)
        
        mock_subprocess.assert_called_once_with(
            ["infracost", "breakdown", "--path", str(file_path), 
             "--terraform-plan-flags=--json", "--format", "json"]
        )
        mock_json_loads.assert_called_once_with("output")
        mock_save.assert_called_once()
        
        assert len(resources) == 2
        assert uid == extract_path.name

def test_process_terraform_file_unsupported(infracost_service):
    """Test processing an unsupported file"""
    file_path = Path("test.txt")
    extract_path = Path("extract_path")
    
    with pytest.raises(ValueError, match="Unsupported file type"):
        infracost_service.process_terraform_file(file_path, extract_path)
        
def test_save_estimate(infracost_service):
    """Test saving an estimate to a file"""
    path = Path("test_path")
    resources = [{"name": "test", "monthlyCost": "10.00"}]
    
    m = mock_open()
    with patch("builtins.open", m):
        infracost_service._save_estimate(path, resources)
        
    m.assert_called_once_with(path / "estimate.json", "w")
    handle = m()
    handle.write.assert_called_once_with(json.dumps(resources, indent=2))

@patch('builtins.open', new_callable=mock_open, read_data=json.dumps([{"name": "test"}]))
def test_get_estimate(mock_file, infracost_service):
    """Test getting an estimate by uid"""
    uid = "test-uid"
    resources = infracost_service.get_estimate(uid)
    
    mock_file.assert_called_once_with(infracost_service.upload_dir / uid / "estimate.json")
    assert resources == [{"name": "test"}]

def test_get_estimate_not_found(infracost_service):
    """Test getting a non-existent estimate"""
    uid = "non-existent"
    
    with pytest.raises(FileNotFoundError):
        infracost_service.get_estimate(uid)

@patch('builtins.open')
def test_compare_estimates(mock_open, infracost_service):
    """Test comparing two estimates"""
    baseline = "baseline-uid"
    proposed = "proposed-uid"
    
    # Mock the baseline file
    baseline_data = [{"name": "resource1", "monthlyCost": "10.00"}]
    # Mock the proposed file
    proposed_data = [
        {"name": "resource1", "monthlyCost": "15.00"}, # Increased cost
        {"name": "resource2", "monthlyCost": "5.00"}   # New resource
    ]
    
    mock_open.side_effect = [
        mock_open(read_data=json.dumps(baseline_data)).return_value,
        mock_open(read_data=json.dumps(proposed_data)).return_value
    ]
    
    result = infracost_service.compare_estimates(baseline, proposed)
    
    assert len(result["increased"]) == 1
    assert result["increased"][0]["name"] == "resource1"
    assert result["increased"][0]["delta"] == 5.0
    
    assert len(result["added"]) == 1
    assert result["added"][0]["name"] == "resource2"
    assert result["added"][0]["delta"] == 5.0
    
    assert len(result["removed"]) == 0
    assert len(result["decreased"]) == 0
    assert len(result["unchanged"]) == 0
