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

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        return {
          error: {
            message: 'Server error: Cloudflare Worker exception',
          },
        };
      }

      // Handle empty responses
      const text = await response.text();
      let data: any = null;
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          // Response is not JSON
          if (!response.ok) {
            return {
              error: {
                message: /<!DOCTYPE|<html|Cloudflare|cf\.errors/i.test(text)
                  ? 'Server error: Cloudflare Worker exception'
                  : (text || 'An error occurred'),
              },
            };
          }
          return { data: { message: text } as T };
        }
      }

      if (!response.ok) {
        return {
          error: {
            message: data?.message || data?.error || 'An error occurred',
            code: data?.code,
          },
        };
      }

      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      // Provide more helpful error messages for common scenarios
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        return {
          error: {
            message: 'Unable to connect to server. Please check if the backend is running.',
          },
        };
      }
      // Handle JSON parsing errors (usually means empty response or backend not running)
      if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected end') || errorMessage.includes('Unexpected token')) {
        return {
          error: {
            message: 'Unable to connect to server. Please check if the backend is running.',
          },
        };
      }
      return {
        error: {
          message: errorMessage,
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

  async googleAuth(code: string) {
    return this.request<{ user: any; session: { token: string; expiresAt: number } }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ code }),
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

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        return {
          error: {
            message: 'Server error: Cloudflare Worker exception',
          },
        };
      }

      // Handle empty responses safely
      const text = await response.text();
      let data: any = null;
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          if (!response.ok) {
            return {
              error: {
                message: 'Server returned an invalid response',
              },
            };
          }
        }
      }

      if (!response.ok) {
        return {
          error: {
            message: data?.error || data?.message || 'An error occurred',
            code: data?.code,
          },
        };
      }

      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('JSON') || errorMessage.includes('Unexpected')) {
        return {
          error: {
            message: 'Unable to connect to server. Please check if the backend is running.',
          },
        };
      }
      return {
        error: {
          message: errorMessage,
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

  async extractResumeText(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/ai/extract-text`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      const text = await response.text();
      let data: any = null;
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          return {
            error: {
              message: 'Server returned an invalid response',
            },
          };
        }
      }
      
      if (!response.ok) {
        return {
          error: {
            message: data?.message || 'Failed to extract text',
          },
        };
      }
      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        error: {
          message: errorMessage.includes('Failed to fetch') ? 
            'Unable to connect to server. Please check if the backend is running.' : 
            errorMessage,
        },
      };
    }
  }

  // Upload endpoints
  async uploadResume(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: formData,
      });
      
      const text = await response.text();
      let data: any = null;
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          return {
            error: {
              message: 'Server returned an invalid response',
            },
          };
        }
      }
      
      if (!response.ok) {
        return {
          error: {
            message: data?.message || 'Upload failed',
          },
        };
      }
      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      return {
        error: {
          message: errorMessage.includes('Failed to fetch') ? 
            'Unable to connect to server. Please check if the backend is running.' : 
            errorMessage,
        },
      };
    }
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

  async confirmPayment(planId: string, sessionId?: string) {
    return this.request<{ 
      success: boolean; 
      plan: { id: string; name: string; monthlyLimit: number };
      message: string;
    }>('/subscriptions/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ planId, sessionId }),
    });
  }

  async getSubscriptionUsage() {
    return this.request<{
      hasSubscription: boolean;
      usageCount: number;
      monthlyLimit: number;
      remaining: number;
      resetDate?: string;
      planName?: string;
    }>('/subscriptions/usage');
  }

  async consumeCredit() {
    return this.request<{
      success: boolean;
      usageCount: number;
      monthlyLimit: number;
      remaining: number | null;
      planName?: string;
    }>('/subscriptions/consume', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

