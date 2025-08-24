# Spotify API Token Setup with Postman

## Step 1: Create Spotify Token in Postman

### Create a new POST request:

**URL**: `https://accounts.spotify.com/api/token`

### Headers:

```
Content-Type: application/x-www-form-urlencoded
Authorization: Basic MTF3NjdmMTQ0OGU2NGZjYmFiNTY3ZWMwMGE1MDUwNTk6ZDY0OGMwNDZjNjM2NDI2ZDgyNWFhMjViYjNjNDZlNDI=
```

### Body (x-www-form-urlencoded):

```
grant_type: client_credentials
scope: playlist-read-private playlist-read-collaborative user-read-private user-read-email
```

### Expected Response:

```json
{
  "access_token": "BQC...", // This is what you need
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Step 2: Update Your Code

1. Copy the `access_token` from the Postman response
2. In `app/(tabs)/results.tsx`, find this line (appears twice):
   ```typescript
   SpotifyStaticService.setAccessToken('YOUR_POSTMAN_TOKEN_HERE');
   ```
3. Replace `YOUR_POSTMAN_TOKEN_HERE` with your actual token:
   ```typescript
   SpotifyStaticService.setAccessToken('BQC..._your_actual_token_here');
   ```

## Step 3: Test Your App

1. Upload a photo
2. The app should now generate playlists without any authentication popup!

## Notes:

- The token expires in 1 hour, so you'll need to generate a new one periodically
- This is perfect for testing and development
- For production, you'd want to implement proper OAuth flow
