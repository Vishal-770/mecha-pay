import { NextResponse } from 'next/server';

/**
 * CORS configuration options
 */
export interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS configuration for API endpoints
 */
const defaultCorsOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: [],
  credentials: false,
  maxAge: 86400, // 24 hours
};

/**
 * Add CORS headers to a NextResponse
 */
export function addCorsHeaders(
  response: NextResponse,
  options: CorsOptions = {}
): NextResponse {
  const opts = { ...defaultCorsOptions, ...options };

  // Set Access-Control-Allow-Origin
  if (opts.origin) {
    const origin = Array.isArray(opts.origin) ? opts.origin.join(', ') : opts.origin;
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  // Set Access-Control-Allow-Methods
  if (opts.methods) {
    response.headers.set('Access-Control-Allow-Methods', opts.methods.join(', '));
  }

  // Set Access-Control-Allow-Headers
  if (opts.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', opts.allowedHeaders.join(', '));
  }

  // Set Access-Control-Expose-Headers
  if (opts.exposedHeaders && opts.exposedHeaders.length > 0) {
    response.headers.set('Access-Control-Expose-Headers', opts.exposedHeaders.join(', '));
  }

  // Set Access-Control-Allow-Credentials
  if (opts.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set Access-Control-Max-Age
  if (opts.maxAge) {
    response.headers.set('Access-Control-Max-Age', opts.maxAge.toString());
  }

  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreFlight(options: CorsOptions = {}): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, options);
}

/**
 * Wrap a response with CORS headers
 */
export function corsResponse(
  data: unknown,
  init?: ResponseInit,
  options?: CorsOptions
): NextResponse {
  const response = NextResponse.json(data, init);
  return addCorsHeaders(response, options);
}
