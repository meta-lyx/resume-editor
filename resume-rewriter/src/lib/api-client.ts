// API Client for Cloudflare Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.message || 'An error occurred',
            code: data.code,
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name: string) {
    return this.request<{ user: any; session: { token: string; expiresAt: number } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; session: { token: string; expiresAt: number } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return result;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async requestPasswordReset(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Resume endpoints
  async getResumes() {
    return this.request<{ resumes: any[] }>('/resumes');
  }

  async getResume(id: string) {
    return this.request<{ resume: any }>(`/resumes/${id}`);
  }

  async createResume(data: {
    title: string;
    content: any;
    job_description?: string;
  }) {
    return this.request<{ resume: any }>('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateResume(id: string, data: any) {
    return this.request<{ resume: any }>(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteResume(id: string) {
    return this.request(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  // AI endpoints
  async processResume(resumeText: string, jobDescription: string, options?: {
    tone?: 'professional' | 'creative' | 'technical';
    focus?: 'skills' | 'experience' | 'achievements' | 'balanced';
  }) {
    // Allow unauthenticated requests for processing
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/ai/process-resume`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ resumeText, jobDescription, options }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            message: data.message || 'An error occurred',
            code: data.code,
          },
        };
      }

      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // Legacy method for backwards compatibility
  async optimizeResume(resumeId: string, jobDescription: string) {
    return this.request<{ optimized_content: any; suggestions: string[] }>(
      '/ai/optimize',
      {
        method: 'POST',
        body: JSON.stringify({ resumeId, jobDescription }),
      }
    );
  }

  async extractResumeText(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(`${this.baseUrl}/ai/extract-text`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return {
          error: {
            message: data.message || 'Failed to extract text',
          },
        };
      }
      return { data };
    });
  }

  // Upload endpoints
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${this.baseUrl}/upload/resume`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return {
          error: {
            message: data.message || 'Upload failed',
          },
        };
      }
      return { data };
    });
  }

  // Subscription endpoints
  async getSubscriptionPlans() {
    return this.request<{ plans: any[] }>('/subscriptions/plans');
  }

  async getCurrentSubscription() {
    return this.request<{ subscription: any }>('/subscriptions/current');
  }

  async createCheckoutSession(planId: string) {
    return this.request<{ checkoutUrl: string; sessionId: string }>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async cancelSubscription() {
    return this.request('/subscriptions/cancel', {
      method: 'POST',
    });
  }

  async getSubscriptionUsage() {
    return this.request<{
      hasSubscription: boolean;
      usageCount: number;
      monthlyLimit: number;
      remaining: number;
      resetDate?: string;
    }>('/subscriptions/usage');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

