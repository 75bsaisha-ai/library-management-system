/**
 * Environment and configuration constants
 */

/**
 * API Base URL - configured from environment or uses default
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Application environment
 */
export const ENV = import.meta.env.MODE || "development";

/**
 * Is production build
 */
export const IS_PRODUCTION = ENV === "production";

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  /**
   * Storage key for auth token
   */
  TOKEN_KEY: "authToken",

  /**
   * Storage key for user data
   */
  USER_KEY: "user",

  /**
   * Storage key for Remember Me preference
   */
  REMEMBER_ME_KEY: "rememberMe",

  /**
   * Token expiration time in hours
   */
  TOKEN_EXPIRY_HOURS: 24,

  /**
   * Session timeout in milliseconds (30 minutes)
   */
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
} as const;

/**
 * Password validation rules
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  REQUIRES_UPPERCASE: true,
  REQUIRES_LOWERCASE: true,
  REQUIRES_NUMBER: true,
  REQUIRES_SPECIAL_CHAR: false,
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REQUEST_RESET: "/auth/request-password-reset",
  AUTH_VERIFY_CODE: "/auth/verify-reset-code",
  AUTH_RESET_PASSWORD: "/auth/reset-password",
  AUTH_CHANGE_PASSWORD: "/auth/change-password",
  AUTH_REFRESH_TOKEN: "/auth/refresh-token",

  // Users
  USERS_PROFILE: "/users/profile",
  USERS_GET: "/users/:id",
  USERS_UPDATE: "/users/:id",

  // Books (for reference)
  BOOKS_LIST: "/books",
  BOOKS_GET: "/books/:id",
  BOOKS_CREATE: "/books",
  BOOKS_UPDATE: "/books/:id",
  BOOKS_DELETE: "/books/:id",

  // Members (for reference)
  MEMBERS_LIST: "/members",
  MEMBERS_GET: "/members/:id",
  MEMBERS_CREATE: "/members",
  MEMBERS_UPDATE: "/members/:id",
  MEMBERS_DELETE: "/members/:id",

  // Borrowings (for reference)
  BORROWINGS_LIST: "/borrowings",
  BORROWINGS_GET: "/borrowings/:id",
  BORROWINGS_CREATE: "/borrowings",
  BORROWINGS_UPDATE: "/borrowings/:id",
  BORROWINGS_DELETE: "/borrowings/:id",
} as const;

/**
 * HTTP Status codes for reference
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Toast notification types
 */
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "destructive",
  INFO: "default",
  WARNING: "warning",
} as const;

/**
 * User roles (for future use)
 */
export const USER_ROLES = {
  ADMIN: "ADMIN",
  LIBRARIAN: "LIBRARIAN",
  MEMBER: "MEMBER",
} as const;

/**
 * Member status
 */
export const MEMBER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  DEACTIVATED: "DEACTIVATED",
} as const;

/**
 * Book status
 */
export const BOOK_STATUS = {
  AVAILABLE: "AVAILABLE",
  BORROWED: "BORROWED",
  RESERVED: "RESERVED",
  DAMAGED: "DAMAGED",
  LOST: "LOST",
} as const;

/**
 * Borrowing status
 */
export const BORROWING_STATUS = {
  ACTIVE: "ACTIVE",
  RETURNED: "RETURNED",
  OVERDUE: "OVERDUE",
  LOST: "LOST",
} as const;
