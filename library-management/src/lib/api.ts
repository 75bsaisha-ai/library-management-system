/**
 * API utility functions for centralized error handling and request management
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Make API request with error handling
 */
export async function apiCall<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        error: data.message || `Error: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      error: message,
      status: 0, // Network error
    };
  }
}

/**
 * Parse API error to user-friendly message
 */
export function parseApiError(error: string | ApiError, defaultMessage = "An error occurred"): string {
  if (typeof error === "string") {
    return error || defaultMessage;
  }

  if (error.message) {
    return error.message;
  }

  return defaultMessage;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(status: number): boolean {
  return status === 0 || status >= 500;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(status: number): boolean {
  return status === 401 || status === 403;
}

/**
 * Get specific error message based on status code
 */
export function getErrorMessage(status: number, defaultMessage: string): string {
  switch (status) {
    case 0:
      return "Network connection failed. Please check your internet connection.";
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Unauthorized. Please log in again.";
    case 403:
      return "Access denied. You don't have permission for this action.";
    case 404:
      return "Resource not found.";
    case 409:
      return "This resource already exists.";
    case 422:
      return "Invalid data provided. Please check your input.";
    case 429:
      return "Too many attempts. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    case 502:
      return "Bad gateway. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return defaultMessage || "An error occurred. Please try again.";
  }
}

/**
 * Retry mechanism for API calls
 */
export async function apiCallWithRetry<T = any>(
  endpoint: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<ApiResponse<T>> {
  let lastError: ApiResponse<T> | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await apiCall<T>(endpoint, options);

    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      return response;
    }

    // Success or client error that shouldn't retry
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    lastError = response;

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return (
    lastError || {
      error: "Failed after maximum retries",
      status: 0,
    }
  );
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

/**
 * Get auth headers with token
 */
export function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
