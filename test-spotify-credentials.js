// Test script to verify Spotify credentials
const CLIENT_ID = '11767f1448e64fcbab567ec00a505059';
const CLIENT_SECRET = 'd648c046c636426d825aa25bb3c46e42';

// Create the credentials string
const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
console.log('Credentials string:', credentials);

// Base64 encode it
const base64Credentials = Buffer.from(credentials).toString('base64');
console.log('Base64 encoded:', base64Credentials);

// Test the API call
async function testSpotifyAPI() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${base64Credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(
        '✅ Success! Access token:',
        data.access_token.substring(0, 20) + '...'
      );
      console.log('Full response:', data);
    } else {
      console.log('❌ Error:', data);
    }
  } catch (error) {
    console.log('❌ Network error:', error);
  }
}

testSpotifyAPI();
