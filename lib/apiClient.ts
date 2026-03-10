const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

type ApiRequestOptions = RequestInit;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'pushToken': process.env.ADMIN_TOKEN, 
};
console.log('API Base URL:', BASE_URL);
console.log('pushToken:', process.env.ADMIN_TOKEN);

export const apiClient = {
  async request(endpoint: string, options: ApiRequestOptions = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // For FormData, don't set Content-Type header - browser handles it automatically
    const headers = options.body instanceof FormData 
      ? { 'pushToken': process.env.ADMIN_TOKEN }
      : defaultHeaders;

    console.log('=== API REQUEST ===');
    console.log('URL:', url);
    console.log('Method:', options.method || 'GET');
    console.log('Headers:', headers);
    
    if (options.body instanceof FormData) {
      console.log('FormData entries:');
      for (let [key, value] of options.body.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      }
    } else if (options.body) {
      console.log('Body:', options.body);
    }

    let response;
    try {
      response = await fetch(url, {
        headers,
        ...options,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }

    console.log('=== API RESPONSE ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Response headers:', Array.from(response.headers.entries()));

    let responseData;
    try {
      responseData = await response.json();
      console.log('Response body:', responseData);
    } catch (e) {
      console.log('Response body (not JSON):', await response.text());
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    if (!response.ok) {
      console.error('Error response:', responseData);
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
