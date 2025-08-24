# Spotify Token Setup Instructions

Follow these detailed steps to get your Spotify app working without OAuth complications.

## Prerequisites

- Postman installed on your computer
- Your Spotify app credentials:
  - Client ID: `11767f1448e64fcbab567ec00a505059`
  - Client Secret: `d648c046c636426d825aa25bb3c46e42`

## Step 1: Create Base64 Credentials

### Option A: Online Tool (Easiest)

1. Go to https://www.base64encode.org/
2. Copy and paste this EXACT string:
   ```
   11767f1448e64fcbab567ec00a505059:d648c046c636426d825aa25bb3c46e42
   ```
3. Click "Encode"
4. Copy the result: `MTF3NjdmMTQ0OGU2NGZjYmFiNTY3ZWMwMGE1MDUwNTk6ZDY0OGMwNDZjNjM2NDI2ZDgyNWFhMjViYjNjNDZlNDI=`

### Option B: Postman Built-in

1. Open Postman
2. Create new request
3. Go to "Authorization" tab
4. Select "Basic Auth"
5. Username: `11767f1448e64fcbab567ec00a505059`
6. Password: `d648c046c636426d825aa25bb3c46e42`
7. Postman will show the generated header

## Step 2: Get Access Token from Spotify

### Create New Request in Postman:

1. Click "+" to create new request
2. Name it "Get Spotify Token"

### Request Configuration:

- **Method**: `POST`
- **URL**: `https://accounts.spotify.com/api/token`

### Headers:

Add these two headers:

```
Content-Type: application/x-www-form-urlencoded
Authorization: Basic MTF3NjdmMTQ0OGU2NGZjYmFiNTY3ZWMwMGE1MDUwNTk6ZDY0OGMwNDZjNjM2NDI2ZDgyNWFhMjViYjNjNDZlNDI=
```

### Body:

1. Select "Body" tab
2. Choose "x-www-form-urlencoded"
3. Add one key-value pair:
   - **Key**: `grant_type`
   - **Value**: `client_credentials`

### Send Request:

1. Click "Send"
2. You should get a response like this:
   ```json
   {
     "access_token": "BQC4YzCqJhfgX7qBKKLHxXXXXXXXXXXX",
     "token_type": "Bearer",
     "expires_in": 3600
   }
   ```

### Important:

- **Copy the `access_token` value** (the long string after "access_token":)
- This token expires in 1 hour (3600 seconds)
- You'll need to get a new token when it expires

## Step 3: Update Your App Code

### Open your app and edit two files:

#### File 1: `services/SpotifyServiceStatic.ts`

Find this line (around line 28):

```typescript
private static ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_FROM_POSTMAN_HERE';
```

Replace `YOUR_ACCESS_TOKEN_FROM_POSTMAN_HERE` with your actual token from Postman:

```typescript
private static ACCESS_TOKEN = 'BQC4YzCqJhfgX7qBKKLHxXXXXXXXXXXX';
```

#### File 2: `app/(tabs)/results.tsx`

Find these lines (around line 61 and 99):

```typescript
SpotifyServiceStatic.setAccessToken('YOUR_POSTMAN_TOKEN_HERE');
```

Replace `YOUR_POSTMAN_TOKEN_HERE` with your actual token:

```typescript
SpotifyServiceStatic.setAccessToken('BQC4YzCqJhfgX7qBKKLHxXXXXXXXXXXX');
```

## Step 4: Test Your App

1. Start your Expo development server:

   ```bash
   npx expo start --tunnel
   ```

2. Scan the QR code with Expo Go

3. Take a photo or select an image

4. The app should now:
   - Detect the mood from your image
   - Search Spotify for matching playlists
   - Display a "Open in Spotify" button

## Troubleshooting

### If you get "Token expired" error:

1. Go back to Postman
2. Send the same request again to get a new token
3. Update both files with the new token
4. Restart your app

### If you get "Invalid token" error:

1. Double-check that you copied the token correctly
2. Make sure there are no extra spaces or characters
3. Verify the Base64 encoding is correct

### If you get "No playlists found":

- This is normal for some moods
- The app will show a message that no playlists were found
- Try with a different image

## Token Expiration

- Tokens expire after 1 hour
- You'll need to get a new token from Postman when this happens
- For production apps, you'd implement automatic token refresh

## Next Steps

Once this is working, you can:

1. Implement automatic token refresh
2. Add more sophisticated mood detection
3. Improve playlist selection algorithms
4. Add user authentication for personalized playlists

## Success Indicators

When everything is working correctly, you should see:
✅ "Spotify configuration loaded successfully" in logs
✅ "Spotify token is valid" in logs
✅ "Found X playlists for [mood]" in logs
✅ "Selected playlist: [playlist name]" in logs
