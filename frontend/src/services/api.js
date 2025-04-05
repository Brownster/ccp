/**
 * API service for interacting with the backend
 */

// Use environment variable for API URL or fallback to localhost
let API_URL = 'http://localhost:8000';
// Safe check for Vite environment
try {
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    API_URL = import.meta.env.VITE_API_URL || API_URL;
  }
} catch (e) {
  // In test environment, this will fail, so we use the default
}

/**
 * Upload a Terraform file for cost estimation
 * @param {File} file - Terraform file to upload
 */
export async function uploadTerraform(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }
  
  return response.json();
}

/**
 * Get a default usage assumption for a resource
 * @param {Object} resource - Resource object
 * @param {string} llm - LLM to use for suggestion (default: "gemini")
 */
export async function getUsageAssumption(resource, llm = 'gemini') {
  const response = await fetch(`${API_URL}/suggest-usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource, llm }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get usage suggestion');
  }
  
  const data = await response.json();
  return data.suggested_usage || 100;
}

/**
 * Get clarifying questions for resources
 * @param {Array} resources - List of resources
 */
export async function getClarifyQuestions(resources) {
  const response = await fetch(`${API_URL}/usage-clarify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resources }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get questions');
  }
  
  const data = await response.json();
  return data.questions || [];
}

/**
 * Generate usage data from answers
 * @param {Object} data - Object containing resources, questions, and answers
 * @param {Array} data.resources - List of resources
 * @param {Array} data.questions - List of questions
 * @param {Array} data.answers - List of answers to questions
 * @param {Array} [answers] - Legacy format: List of answer objects with resource_name
 */
export async function generateUsage(data, answers) {
  // Handle both new and legacy format
  const requestData = answers ? { resources: data, answers } : data;

  const response = await fetch(`${API_URL}/usage-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate usage');
  }
  
  const responseData = await response.json();
  return responseData.usage || {};
}

/**
 * Ask a question to the AI copilot
 * @param {string} question - User's question
 * @param {Array} resources - List of resources for context
 */
export async function askCopilot(question, resources) {
  const response = await fetch(`${API_URL}/copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, resources }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get answer');
  }
  
  const data = await response.json();
  return data.answer || 'Sorry, I could not answer that question.';
}

/**
 * Download an estimate by UID
 * @param {string} uid - Estimate UID
 * @param {string} format - Format (json or csv)
 */
export async function downloadEstimate(uid, format = 'json') {
  const response = await fetch(`${API_URL}/download/${uid}?format=${format}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to download estimate');
  }
  
  return response.json();
}

/**
 * Compare two estimates
 * @param {string} baseline - Baseline estimate UID
 * @param {string} proposed - Proposed estimate UID
 */
export async function compareEstimates(baseline, proposed) {
  const response = await fetch(`${API_URL}/compare?baseline=${baseline}&proposed=${proposed}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to compare estimates');
  }
  
  return response.json();
}

/**
 * Compare with adjustments
 * @param {string} uid - Estimate UID
 * @param {Array} current - Current resources with adjustments
 */
export async function compareAdjusted(uid, current) {
  const response = await fetch(`${API_URL}/compare-adjusted`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, current }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to compare adjusted');
  }
  
  return response.json();
}

/**
 * Analyze a diff
 * @param {string} diff - Diff text
 */
export async function analyzeDiff(diff) {
  const response = await fetch(`${API_URL}/analyze-diff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diff }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze diff');
  }
  
  const data = await response.json();
  return data.summary || 'Could not analyze diff.';
}

/**
 * Get all available templates
 */
export async function getTemplates() {
  const response = await fetch(`${API_URL}/templates`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get templates');
  }
  
  const data = await response.json();
  return data.templates || [];
}

/**
 * Get a template by ID
 * @param {string} templateId - Template ID
 */
export async function getTemplateById(templateId) {
  const response = await fetch(`${API_URL}/templates/${templateId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get template');
  }
  
  return response.json();
}

/**
 * Create a new template
 * @param {Object} template - Template object
 */
export async function createTemplate(template) {
  const response = await fetch(`${API_URL}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create template');
  }
  
  return response.json();
}

/**
 * Delete a template
 * @param {string} templateId - Template ID
 */
export async function deleteTemplate(templateId) {
  const response = await fetch(`${API_URL}/templates/${templateId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete template');
  }
  
  return response.json();
}

/**
 * Apply a template to resources
 * @param {string} templateId - Template ID
 * @param {Array} resources - Resources to apply the template to
 */
export async function applyTemplate(templateId, resources) {
  const response = await fetch(`${API_URL}/apply-template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template_id: templateId, resources }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to apply template');
  }
  
  const data = await response.json();
  return data.usage || {};
}
