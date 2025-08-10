# Echo Provider Implementation

This document outlines the implementation of the Echo authentication provider for sending money functionality.

## What has been implemented:

### 1. Environment Variables (`src/env.js`)

- Added `ECHO_APP_ID` environment variable support
- The provider will only be available when this environment variable is set

### 2. Echo OAuth Provider (`src/server/auth/providers/echo.ts`)

- Created custom OAuth provider for Echo authentication
- Configured with Echo's OAuth endpoints:
  - Authorization: `https://echo.merit.systems/api/oauth/authorize`
  - Token: `https://echo.merit.systems/api/oauth/token`
  - User info: `https://echo.merit.systems/api/oauth/userinfo`
- Requests `llm:invoke offline_access` scopes
- Handles profile mapping from Echo's response format

### 3. Provider Registration (`src/server/auth/providers/index.ts`)

- Added Echo provider to the providers array
- Provider is conditionally loaded when `ECHO_APP_ID` environment variable exists
- Configured with `allowDangerousEmailAccountLinking: true`

### 4. Database Query Helpers (`src/lib/db/queries.ts`)

- `getAccountByUserId()` - Retrieves Echo account for a user
- `updateTokensByUserId()` - Updates Echo tokens for token refresh

### 5. Authentication Configuration (`src/server/auth/config.ts`)

- Enhanced `signIn` callback to handle Echo-specific token updates
- Enhanced `session` callback to handle Echo token refresh automatically
- Token refresh logic that calls Echo's refresh endpoint when tokens expire
- Error handling for failed token refresh attempts

### 6. Protected Echo Route (`src/app/(general)/echo/page.tsx`)

- Protected page that requires authentication
- Checks if user has Echo account connected
- Redirects to Echo OAuth flow if no account is connected
- Provides UI for money sending functionality (placeholder)

### 7. Navigation Integration

- Added "Echo Payments" link to sidebar navigation (`src/app/(general)/_components/sidebar/main.tsx`)
- Added "Echo Payments" link to user account dropdown (`src/app/_components/navbar/account-button/authenticated.tsx`)
- Added Echo icon support in provider icons (`src/app/_components/navbar/account-button/provider-icon.tsx`)

### 8. Assets

- Added Echo icon at `public/icons/echo.png` (placeholder)

## How it works:

1. **Authentication Flow**:

   - User clicks "Sign In with Echo" or navigates to `/echo`
   - If not authenticated, redirected to login with Echo option
   - OAuth flow handled by NextAuth with Echo endpoints
   - Tokens stored in database with automatic refresh

2. **Token Management**:

   - Access tokens are automatically refreshed when expired
   - Refresh tokens are used to obtain new access tokens
   - Failed refresh attempts are logged but don't break the session

3. **Route Protection**:
   - `/echo` route requires authentication
   - Automatically redirects to Echo OAuth if user hasn't connected Echo account
   - Only prompts for Echo authentication when accessing Echo-specific functionality

## Environment Setup:

To enable Echo provider, set the following environment variable:

```env
ECHO_APP_ID=your_echo_app_id_here
```

The provider will automatically appear in sign-in options when this variable is configured.

## Security Notes:

- All OAuth flows use HTTPS endpoints
- Tokens are securely stored in the database
- Token refresh happens server-side to protect credentials
- Error handling prevents token exposure in logs
