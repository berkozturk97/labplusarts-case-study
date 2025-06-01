# Error Toast Middleware

This middleware automatically shows toast notifications for all RTK Query API errors, centralizing error handling across the application.

## Features

- **Automatic Error Detection**: Intercepts all failed RTK Query actions using `isRejectedWithValue`
- **Smart Error Extraction**: Handles various error response formats (string, object, validation errors)
- **Configurable Error Types**: Can be configured to show/hide different types of errors
- **Contextual Messages**: Extracts API endpoint names for more meaningful error messages
- **Toast Types**: Shows warnings for 4xx errors and errors for 5xx/network errors

## Usage

The middleware is automatically applied to the Redux store in `src/store/index.ts`:

```typescript
import { errorToastMiddleware } from "../middleware/errorToastMiddleware";

export const store = configureStore({
  // ... other config
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(errorToastMiddleware),
});
```

## Configuration

You can customize the middleware behavior by creating a configured instance:

```typescript
import { createErrorToastMiddleware } from "../middleware/errorToastMiddleware";

const customErrorMiddleware = createErrorToastMiddleware({
  showNetworkErrors: true,     // Show connection/timeout errors
  showValidationErrors: true,  // Show 4xx client errors
  showServerErrors: true,      // Show 5xx server errors
  defaultErrorMessage: "Custom error message",
  toastDuration: 5000,        // Toast display duration in ms
});
```

## Error Message Extraction

The middleware intelligently extracts error messages from various API response formats:

- **String responses**: Used directly
- **Object responses**: Checks for `message`, `error`, `detail`, `description` fields
- **Validation errors**: Handles arrays and field-specific error objects
- **Network errors**: Shows connection/timeout specific messages

## Error Types

- **Network Errors** (FETCH_ERROR, TIMEOUT_ERROR): Connection issues
- **Validation Errors** (4xx): Client-side validation failures (shown as warnings)
- **Server Errors** (5xx): Server-side issues (shown as errors)

## Benefits

1. **Centralized Error Handling**: No need to handle errors in individual components/hooks
2. **Consistent UX**: All errors are displayed with the same toast styling
3. **Reduced Boilerplate**: Eliminates repetitive error handling code
4. **Better Debugging**: Errors are logged to console for development
5. **Flexible Configuration**: Can be customized per application needs

## Integration with Forms

With this middleware, form components and hooks only need to handle success cases:

```typescript
// Before: Manual error handling
try {
  await createUser(data);
  toast.success("User created!");
} catch (error) {
  toast.error(extractErrorMessage(error));
}

// After: Automatic error handling
try {
  const result = await createUser(data);
  toast.success(`User "${result.name}" created!`);
} catch (error) {
  // Error toast is automatically shown by middleware
  // Just handle any cleanup if needed
}
``` 