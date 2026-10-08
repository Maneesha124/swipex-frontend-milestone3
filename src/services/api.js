/**
 * SwipeX Central API Client & Gateway Service
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('swipex_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    if (response.status === 204) return true;

    return await response.json();
  } catch (error) {
    console.warn(`[API Gateway Network Notice] ${endpoint}:`, error.message);
    throw error;
  }
}

// 1. AUTH SERVICE EXPORTS
export const getCurrentUser = () => request('/auth/me');
export const AuthService = { getCurrentUser };

// 2. JOB SERVICE EXPORTS
export const searchJobs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.location) params.append('location', filters.location);
  if (filters.skills) params.append('skills', filters.skills);
  return request(`/jobs/search?${params.toString()}`);
};

export const getJobs = (page = 1, pageSize = 20, filters = {}) => {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (filters.type) params.append('type', filters.type);
  if (filters.location) params.append('location', filters.location);
  return request(`/jobs?${params.toString()}`);
};

export const getJobById = (jobId) => request(`/jobs/${jobId}`);

export const JobService = {
  getJobs,
  searchJobs,
  getJobById,
};

// 3. RESUME & ATS SCORING SERVICE EXPORTS
export const getResumes = () => request('/resumes');

export const uploadResume = async (formData) => {
  const token = localStorage.getItem('swipex_auth_token');
  const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
    method: 'POST',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
  }
  return response.json();
};

export const setActiveVersion = (resumeId) => 
  request(`/resumes/${resumeId}/activate`, { method: 'PATCH' });

export const deleteResume = (resumeId) => 
  request(`/resumes/${resumeId}`, { method: 'DELETE' });

export const ResumeService = {
  getResumes,
  uploadResume,
  setActiveVersion,
  deleteResume,
};

export const getAtsScore = (resumeId, jobId) =>
  request('/ats/score', {
    method: 'POST',
    body: JSON.stringify({
      resume_id: String(resumeId),
      job_id: String(jobId),
    }),
  });

export const getAtsSuggestions = (resumeId, jobId) =>
  request('/ats/suggestions', {
    method: 'POST',
    body: JSON.stringify({
      resume_id: String(resumeId),
      job_id: String(jobId),
    }),
  });

export const AtsService = {
  getAtsScore,
  getAtsSuggestions,
};

// 4. RECOMMENDATION SERVICE EXPORTS
export const getUpgradedRecommendations = (limit = 10) =>
  request(`/recommendations/?limit=${limit}`);

export const getPersonalizedRecommendations = (userId, limit = 50, filters = {}) => {
  const params = new URLSearchParams({ user_id: userId, limit });
  if (filters.workplaceType) params.append('workplace_type', filters.workplaceType);
  if (filters.hybrid) params.append('hybrid', 'true');
  return request(`/recommendations?${params.toString()}`);
};

export const getMatchBreakdown = (jobId, userId) => 
  request(`/recommendations/breakdown?job_id=${jobId}&user_id=${userId}`);

export const RecommendationService = {
  getUpgradedRecommendations,
  getPersonalizedRecommendations,
  getMatchBreakdown,
};

// 5. SWIPE SERVICE EXPORTS
export const recordCandidateSwipe = (userId, jobId, action = 'like') => 
  request('/swipe', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      job_id: String(jobId),
      action: action,
    }),
  });

export const recordSwipe = (jobId, direction, actionType = 'apply', notes = '') => 
  request('/swipes', {
    method: 'POST',
    body: JSON.stringify({
      job_id: jobId,
      direction: direction,
      action_type: actionType,
      notes: notes,
    }),
  });

export const getSwipeHistory = () => request('/swipes/history');

export const undoSwipe = (jobId) => request(`/swipes/${jobId}`, { method: 'DELETE' });

export const SwipeService = {
  recordCandidateSwipe,
  recordSwipe,
  getSwipeHistory,
  undoSwipe,
};

// 6. COMPANY SERVICE EXPORTS (Fixes CompanyProfile.jsx import error)
export const getCompanies = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/companies${query ? `?${query}` : ''}`);
};

export const getCompanyById = (id) => request(`/companies/${id}`);

export const CompanyService = {
  getCompanies,
  getCompanyById,
};

// 7. SAVED JOBS SERVICE EXPORTS
export const saveJob = (jobId, notes = '') =>
  request('/saved-jobs', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, notes }),
  });

export const getSavedJobs = () => request('/saved-jobs');

export const unsaveJob = (jobId) => request(`/saved-jobs/${jobId}`, { method: 'DELETE' });

export const SavedJobService = {
  saveJob,
  getSavedJobs,
  unsaveJob,
};

// DEFAULT EXPORT
export default {
  AuthService,
  JobService,
  searchJobs,
  getJobs,
  getJobById,
  ResumeService,
  AtsService,
  RecommendationService,
  SwipeService,
  CompanyService,
  getCompanies,
  getCompanyById,
  SavedJobService,
};