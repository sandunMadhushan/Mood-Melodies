/**
 * SpotifyService - Handles Spotify playlist generation based on mood
 * 
 * This service simulates Spotify Web API integration
 * In a production app, you would:
 * 1. Authenticate with Spotify using OAuth 2.0
 * 2. Search for playlists or tracks based on mood/genre
 * 3. Create custom playlists for users
 * 4. Handle API rate limits and authentication tokens
 */

export class SpotifyService {
  // Mock playlist URIs from real Spotify playlists
  // These are actual Spotify playlist IDs that work in embeds
  private static MOOD_PLAYLISTS: { [key: string]: string } = {
    'Happy': '37i9dQZF1DXdPec7aJc1u6', // Happy Hits!
    'Sad': '37i9dQZF1DWSqBruwoIXkA', // Sad Songs
    'Calm': '37i9dQZF1DWU0ScTcjAxCX', // Peaceful Piano
    'Energetic': '37i9dQZF1DX3rxVfSAhnEM', // Beast Mode
    'Excited': '37i9dQZF1DX0XUsuxWHRQd', // RapCaviar
    'Peaceful': '37i9dQZF1DX4sWSpwq3LiO', // Peaceful Guitar
  };

  // Alternative playlists for variety
  private static ALTERNATIVE_PLAYLISTS: { [key: string]: string[] } = {
    'Happy': [
      '37i9dQZF1DX0XUsuxWHRQd',
      '37i9dQZF1DXdPec7aJc1u6',
      '37i9dQZF1DX4fpCWaHOned',
    ],
    'Sad': [
      '37i9dQZF1DWSqBruwoIXkA',
      '37i9dQZF1DX3YSRoSdA634',
      '37i9dQZF1DX7qK8ma5wgG1',
    ],
    'Calm': [
      '37i9dQZF1DWU0ScTcjAxCX',
      '37i9dQZF1DX4sWSpwq3LiO',
      '37i9dQZF1DWZqd5JICZI0u',
    ],
    'Energetic': [
      '37i9dQZF1DX3rxVfSAhnEM',
      '37i9dQZF1DX0XUsuxWHRQd',
      '37i9dQZF1DXdxcBWuJkOwX',
    ],
    'Excited': [
      '37i9dQZF1DX0XUsuxWHRQd',
      '37i9dQZF1DXdPec7aJc1u6',
      '37i9dQZF1DX3rxVfSAhnEM',
    ],
    'Peaceful': [
      '37i9dQZF1DX4sWSpwq3LiO',
      '37i9dQZF1DWU0ScTcjAxCX',
      '37i9dQZF1DWZqd5JICZI0u',
    ],
  };

  /**
   * Get a Spotify playlist URI based on detected mood
   * @param mood - The detected mood category
   * @returns Promise<string> - Spotify playlist URI
   */
  static async getPlaylistForMood(mood: string): Promise<string> {
    try {
      // Simulate API call delay (1-2 seconds)
      await this.delay(1000 + Math.random() * 1000);

      console.log(`Finding playlist for mood: ${mood}`);

      /* 
       * REAL IMPLEMENTATION WOULD LOOK LIKE:
       * 
       * // 1. Authenticate with Spotify
       * const token = await this.getSpotifyAccessToken();
       * 
       * // 2. Search for playlists based on mood
       * const response = await fetch(
       *   `https://api.spotify.com/v1/search?q=${mood}&type=playlist&limit=10`,
       *   {
       *     headers: {
       *       'Authorization': `Bearer ${token}`,
       *       'Content-Type': 'application/json'
       *     }
       *   }
       * );
       * 
       * // 3. Parse response and select best matching playlist
       * const data = await response.json();
       * const playlists = data.playlists.items;
       * 
       * // 4. Apply filtering logic (popularity, relevance, etc.)
       * const bestPlaylist = this.selectBestPlaylist(playlists, mood);
       * 
       * return bestPlaylist.id;
       */

      // Get the primary playlist for this mood
      const primaryPlaylist = this.MOOD_PLAYLISTS[mood];
      
      if (primaryPlaylist) {
        // Occasionally return an alternative for variety (20% chance)
        if (Math.random() < 0.2 && this.ALTERNATIVE_PLAYLISTS[mood]) {
          const alternatives = this.ALTERNATIVE_PLAYLISTS[mood];
          const randomIndex = Math.floor(Math.random() * alternatives.length);
          return alternatives[randomIndex];
        }
        
        return primaryPlaylist;
      }

      // Fallback to a default happy playlist if mood not found
      console.warn(`Mood '${mood}' not found, using default playlist`);
      return this.MOOD_PLAYLISTS['Happy'];

    } catch (error) {
      console.error('Spotify API error:', error);
      
      // In a real app, implement proper error handling:
      // - Retry logic for network failures
      // - Token refresh for expired authentication
      // - Fallback to cached playlists
      
      throw new Error('Failed to get playlist for mood');
    }
  }

  /**
   * Get multiple playlist recommendations for a mood
   * @param mood - The detected mood category
   * @param count - Number of playlists to return (default: 3)
   * @returns Promise<string[]> - Array of Spotify playlist URIs
   */
  static async getMultiplePlaylistsForMood(mood: string, count: number = 3): Promise<string[]> {
    try {
      const alternatives = this.ALTERNATIVE_PLAYLISTS[mood];
      
      if (!alternatives || alternatives.length === 0) {
        // Return primary playlist if no alternatives
        const primary = await this.getPlaylistForMood(mood);
        return [primary];
      }

      // Shuffle and return requested count
      const shuffled = [...alternatives].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));

    } catch (error) {
      console.error('Failed to get multiple playlists:', error);
      throw error;
    }
  }

  /**
   * Authenticate with Spotify API (mock implementation)
   * In a real app, this would handle OAuth 2.0 flow
   * @returns Promise<string> - Access token
   */
  private static async getSpotifyAccessToken(): Promise<string> {
    // Mock OAuth 2.0 flow
    // Real implementation would:
    // 1. Redirect user to Spotify authorization
    // 2. Handle callback with authorization code
    // 3. Exchange code for access token
    // 4. Refresh tokens when expired
    
    await this.delay(500);
    return 'mock_spotify_access_token';
  }

  /**
   * Select the best playlist from search results
   * @param playlists - Array of playlist objects from Spotify API
   * @param mood - Target mood for filtering
   * @returns Playlist object
   */
  private static selectBestPlaylist(playlists: any[], mood: string) {
    // Example selection logic:
    // - Filter by follower count (popularity)
    // - Match playlist name/description to mood
    // - Prefer official Spotify playlists
    // - Consider playlist length and recent updates
    
    return playlists
      .filter(playlist => playlist.tracks.total > 20) // Minimum track count
      .sort((a, b) => b.followers.total - a.followers.total) // Sort by popularity
      [0]; // Return most popular
  }

  /**
   * Utility function to simulate network delay
   * @param ms - Milliseconds to delay
   * @returns Promise<void>
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if Spotify service is available
   * @returns Promise<boolean>
   */
  static async isServiceAvailable(): Promise<boolean> {
    try {
      await this.delay(300);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get mood categories supported by the service
   * @returns string[] - Array of supported mood categories
   */
  static getSupportedMoods(): string[] {
    return Object.keys(this.MOOD_PLAYLISTS);
  }
}