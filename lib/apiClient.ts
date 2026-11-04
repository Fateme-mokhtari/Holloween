const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiRequestOptions = RequestInit;

function buildHeaders(body: RequestInit["body"]): Record<string, string> {
  const headers: Record<string, string> = {};

  // For FormData, don't set Content-Type header - browser adds it with the multipart boundary
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Only send the token when it is set; otherwise fetch would send the text "undefined"
  const token = process.env.ADMIN_TOKEN;
  if (token) {
    headers.pushToken = token;
  }

  return headers;
}

export const apiClient = {
  async request(endpoint: string, options: ApiRequestOptions = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = buildHeaders(options.body);

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
      console.error(
        `[apiClient] ${response.status} ${response.statusText}:`,
        responseData,
      );
      throw new Error(
        `API Error: ${response.status} - ${JSON.stringify(responseData)}`,
      );
    }

    return responseData;
  },

  get(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request(endpoint, { method: "GET", ...options });
  },

  post(endpoint: string, data: unknown, options: ApiRequestOptions = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  },

  put(endpoint: string, data: unknown, options: ApiRequestOptions = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  },

  delete(endpoint: string, options: ApiRequestOptions = {}) {
    return this.request(endpoint, { method: "DELETE", ...options });
  },

  postFormData(
    endpoint: string,
    formData: FormData,
    options: ApiRequestOptions = {},
  ) {
    return this.request(endpoint, {
      method: "POST",
      body: formData,
      ...options,
    });
  },
};
