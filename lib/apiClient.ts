const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

type ApiRequestOptions = RequestInit;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'pushToken': process.env.ADMIN_TOKEN, 
};

export const apiClient = {
  async request(endpoint: string, options: ApiRequestOptions = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // For FormData, don't set Content-Type header - browser handles it automatically
    const headers = options.body instanceof FormData 
      ? { 'pushToken': process.env.ADMIN_TOKEN }
      : defaultHeaders;

    let response;
    try {
      response = await fetch(url, {
        headers,
        ...options,
      });
    } catch (error) {
      console.error(`[apiClient] Fetch failed for ${url}:`, error);
      throw error;
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    if (!response.ok) {
      console.error(`[apiClient] ${response.status} ${response.statusText}:`, responseData);
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    return responseData;
  },

  get(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  },

  post(endpoint: string, data: unknown, options: ApiRequestOptions = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },

  put(endpoint: string, data: unknown, options: ApiRequestOptions = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  },

  delete(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  },

  postFormData(endpoint: string, formData: FormData, options: ApiRequestOptions = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      ...options,
    });
  },
};
