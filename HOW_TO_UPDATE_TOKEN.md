# How to Update Your Spotify Token

## When You Need to Update

Your Spotify access token expires after 1 hour (3600 seconds). When it expires, you'll need to get a new one from Postman.

## Steps to Get New Token from Postman

1. **Open Postman**
2. **Use your saved request** (or create new one):

   - Method: `POST`
   - URL: `https://accounts.spotify.com/api/token`
   - Authorization: Basic Auth
     - Username: `11767f1448e64fcbab567ec00a505059`
     - Password: `d648c046c636426d825aa25bb3c46e42`
   - Body (x-www-form-urlencoded):
     - Key: `grant_type`
     - Value: `client_credentials`

3. **Click Send**

4. **Copy the new access_token from the response**

## Update the Token in Your App

Open the file: `services/SimpleSpotifyService.ts`

Find this line:

```typescript
private static ACCESS_TOKEN = 'BQAVmTVScEUx6a3cRlf4dhB6oShjKUzIjkBLLqlkAjdK57c3sCJ8qd2Hfl93aV6J9JAxyTRKO6KxjpouhpFUvRDF-q0VYWfxjeB7zVx7h6SmHqMGrS-tDxqaiX9Xgg68-gCB5VcKjqM';
```

Replace the token string with your new token from Postman.

## Signs Your Token Has Expired

- App shows "No playlists found" error
- Console shows 401 Unauthorized errors
- Playlists stop loading

## Example Postman Response

```json
{
  "access_token": "BQAVmTVScEUx6a3cRlf4dhB6oShjKUzIjkBLLqlkAjdK57c3sCJ8qd2Hfl93aV6J9JAxyTRKO6KxjpouhpFUvRDF-q0VYWfxjeB7zVx7h6SmHqMGrS-tDxqaiX9Xgg68-gCB5VcKjqM",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Copy the `access_token` value (the long string) and paste it in the SimpleSpotifyService.ts file.
