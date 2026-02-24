# CORS Configuration

This project has CORS (Cross-Origin Resource Sharing) enabled for all API endpoints to allow requests from any origin.

## Global Configuration

CORS is globally enabled via the Next.js middleware (`middleware.ts`). This automatically adds CORS headers to all API routes matching `/api/*`.

### Default Settings

- **Origins**: `*` (all origins allowed)
- **Methods**: `GET, POST, PUT, DELETE, OPTIONS`
- **Headers**: `Content-Type, Authorization, x-api-key`
- **Max Age**: 86400 seconds (24 hours)

## Middleware Approach

The middleware handles:
1. **Preflight requests** (OPTIONS) - Returns 200 with CORS headers
2. **Actual requests** - Adds CORS headers to responses

This approach works automatically for all API routes without modifying individual route handlers.

## Custom CORS for Specific Routes

If you need custom CORS settings for specific routes, use the utility functions from `lib/cors.ts`:

```typescript
import { corsResponse, handleCorsPreFlight } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreFlight({
    origin: 'https://example.com',
    credentials: true,
  });
}

export async function GET() {
  const data = { message: 'Hello' };
  return corsResponse(data, { status: 200 }, {
    origin: 'https://example.com',
    credentials: true,
  });
}
```

## Security Considerations

### Production Recommendations

For production environments, consider restricting CORS origins:

```typescript
// In middleware.ts, update the headers:
const allowedOrigins = [
  'https://yourdomain.com',
  'https://app.yourdomain.com',
];

const origin = request.headers.get('origin');
if (origin && allowedOrigins.includes(origin)) {
  response.headers.set('Access-Control-Allow-Origin', origin);
}
```

### API Key Protection

Even with CORS enabled, API endpoints are protected by:
- API key authentication (`x-api-key` header)
- User token validation
- Rate limiting (if implemented)

### Best Practices

1. **Restrict origins in production** - Don't use `*` for production APIs
2. **Use HTTPS only** - Ensure all API calls use secure connections
3. **Validate credentials** - Always validate API keys and user tokens
4. **Implement rate limiting** - Prevent abuse of public endpoints
5. **Monitor usage** - Track API usage and suspicious patterns

## Testing CORS

### Using cURL

```bash
# Test preflight request
curl -X OPTIONS http://localhost:3000/api/v1/balance \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: x-api-key" \
  -v

# Test actual request
curl -X GET http://localhost:3000/api/v1/balance \
  -H "x-api-key: your-api-key" \
  -H "Origin: http://example.com" \
  -v
```

### Using JavaScript

```javascript
fetch('http://localhost:3000/api/v1/balance', {
  method: 'GET',
  headers: {
    'x-api-key': 'your-api-key',
    'Content-Type': 'application/json',
  },
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## Troubleshooting

### CORS errors still occurring?

1. **Check middleware is loaded** - Restart the dev server
2. **Verify path matcher** - Ensure the route matches `/api/:path*`
3. **Check browser console** - Look for specific CORS error messages
4. **Verify headers** - Use browser DevTools Network tab to inspect headers
5. **Clear cache** - Sometimes browsers cache preflight responses

### Common Issues

- **401 errors**: This is authentication, not CORS - check your API key
- **Preflight failures**: Ensure OPTIONS method is properly handled
- **Credentials mode**: If using cookies, set `credentials: 'include'` in fetch
