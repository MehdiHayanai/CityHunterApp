import Cookies from "js-cookie";

// Use Next.js API proxy route to inject API key server-side
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function fetchWithAuth(endpoint: string, options: FetchOptions = {}) {
  // Retrieve token from cookies
  const token = Cookies.get('access_token');
  const { timeout = 30000, ...fetchOptions } = options; // Default 30s timeout

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    // console.log(`[API Request] ${options.method || 'GET'} ${url}`); 

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(id);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[API Error] ${response.status} ${url}`, errorData);
      throw new Error(errorData.detail || `API Error: ${response.statusText} (${response.status})`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
        console.error(`[API Timeout] Request to ${endpoint} timed out after ${timeout}ms`);
        throw new Error(`Request timed out after ${timeout/1000}s`);
    }
    console.error(`[Network/API Error] Failed to fetch ${API_BASE_URL}${endpoint}`, error);
    throw error;
  }
}
