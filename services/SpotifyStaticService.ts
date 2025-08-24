import Constants from 'expo-constants';

export class SpotifyStaticService {
  // You'll paste your Postman-generated token here
  private static ACCESS_TOKEN = 'YOUR_POSTMAN_TOKEN_HERE'; // Replace with actual token from Postman

  /**
   * Set the access token obtained from Postman
   * @param token - The access token from Postman API call
   */
  static setAccessToken(token: string): void {
    this.ACCESS_TOKEN = token;
  }

  /**
   * Get current access token
   * @returns string | null
   */
  static getAccessToken(): string | null {
    if (!this.ACCESS_TOKEN || this.ACCESS_TOKEN === 'YOUR_POSTMAN_TOKEN_HERE') {
      console.error(
        '❌ No access token set. Please call setAccessToken() with your Postman token'
      );
      return null;
    }
    return this.ACCESS_TOKEN;
  }

  /**
   * Search for playlists based on mood keywords
   * @param mood - The detected mood
   * @returns Promise<any[]>
   */
  static async searchPlaylistsByMood(mood: string): Promise<any[]> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Map moods to search keywords
    const moodKeywords: { [key: string]: string[] } = {
      Happy: ['happy', 'upbeat', 'cheerful', 'positive', 'joyful'],
      Sad: ['sad', 'melancholy', 'blues', 'emotional', 'heartbreak'],
      Energetic: ['energetic', 'workout', 'pump up', 'high energy', 'dance'],
      Calm: ['calm', 'relaxing', 'chill', 'peaceful', 'ambient'],
      Angry: ['angry', 'aggressive', 'intense', 'metal', 'hardcore'],
      Romantic: ['romantic', 'love', 'romantic dinner', 'date night'],
      Nostalgic: ['nostalgic', 'throwback', 'oldies', 'memories', 'classic'],
    };

    const keywords = moodKeywords[mood] || [mood.toLowerCase()];
    const searchQuery = keywords.join(' OR ');

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchQuery
        )}&type=playlist&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Spotify API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.playlists?.items || [];
    } catch (error) {
      console.error('Error searching playlists:', error);
      throw error;
    }
  }

  /**
   * Get a playlist for the detected mood
   * @param mood - The detected mood
   * @returns Promise<any | null>
   */
  static async getPlaylistForMood(mood: string): Promise<any | null> {
    try {
      const playlists = await this.searchPlaylistsByMood(mood);

      if (playlists.length === 0) {
        console.log(`No playlists found for mood: ${mood}`);
        return null;
      }

      // Select the best playlist (first one with good follower count)
      const bestPlaylist =
        playlists.find((p) => p.followers?.total > 1000) || playlists[0];

      console.log(`🎵 Found playlist for ${mood}:`, bestPlaylist.name);
      return bestPlaylist;
    } catch (error) {
      console.error('Error getting playlist for mood:', error);
      return null;
    }
  }

  /**
   * Test the API connection
   * @returns Promise<boolean>
   */
  static async testConnection(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return false;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
