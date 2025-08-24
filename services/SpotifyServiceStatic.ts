/**
 * Static Spotify Service - Uses a pre-generated access token
 * Perfect for testing without OAuth complications
 */

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    total: number;
  };
}

export interface SpotifySearchResponse {
  playlists: {
    items: SpotifyPlaylist[];
    total: number;
  };
}

export class SpotifyServiceStatic {
  // TODO: Replace this with your actual token from Postman
  private static ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_FROM_POSTMAN_HERE';

  /**
   * Update the access token
   * Call this method with the token you got from Postman
   */
  static setAccessToken(token: string): void {
    this.ACCESS_TOKEN = token;
    console.log('✅ Spotify access token updated');
  }

  /**
   * Get playlists based on mood
   * @param mood - The detected mood from the image
   * @returns Promise<SpotifyPlaylist | null>
   */
  static async getPlaylistForMood(
    mood: string
  ): Promise<SpotifyPlaylist | null> {
    try {
      if (this.ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_FROM_POSTMAN_HERE') {
        console.error('❌ Please set your Spotify access token first!');
        console.log('📝 Instructions:');
        console.log('1. Get token from Postman');
        console.log(
          '2. Call SpotifyServiceStatic.setAccessToken("your_token_here")'
        );
        return null;
      }

      // Map moods to search keywords
      const moodKeywords = this.getMoodKeywords(mood);
      console.log(
        `🎵 Searching for ${mood} playlists with keywords:`,
        moodKeywords
      );

      // Search for playlists
      const playlists = await this.searchPlaylistsByMood(moodKeywords);

      if (playlists.length === 0) {
        console.log('❌ No playlists found for this mood');
        return null;
      }

      // Select the best playlist (for now, just pick the first one with good metrics)
      const selectedPlaylist = this.selectBestPlaylist(playlists, mood);
      console.log(`✅ Selected playlist: "${selectedPlaylist.name}"`);

      return selectedPlaylist;
    } catch (error) {
      console.error('Spotify playlist search error:', error);
      return null;
    }
  }

  /**
   * Search for playlists using Spotify API
   */
  private static async searchPlaylistsByMood(
    keywords: string[]
  ): Promise<SpotifyPlaylist[]> {
    const allPlaylists: SpotifyPlaylist[] = [];

    for (const keyword of keywords) {
      try {
        const query = encodeURIComponent(`"${keyword}" mood playlist`);
        const url = `https://api.spotify.com/v1/search?q=${query}&type=playlist&limit=10`;

        console.log(`🔍 Searching: ${keyword}`);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              '❌ Access token expired or invalid. Get a new token from Postman!'
            );
          }
          throw new Error(
            `Search failed: ${response.status} ${response.statusText}`
          );
        }

        const data: SpotifySearchResponse = await response.json();

        // Filter and add playlists
        const filteredPlaylists = data.playlists.items.filter(
          (playlist) =>
            playlist.tracks.total > 10 && // At least 10 tracks
            playlist.name.toLowerCase().includes(keyword.toLowerCase())
        );

        allPlaylists.push(...filteredPlaylists);
        console.log(
          `✅ Found ${filteredPlaylists.length} playlists for "${keyword}"`
        );
      } catch (error) {
        console.error(`Search error for keyword "${keyword}":`, error);
      }
    }

    return allPlaylists;
  }

  /**
   * Map detected mood to search keywords
   */
  private static getMoodKeywords(mood: string): string[] {
    const moodMap: { [key: string]: string[] } = {
      happy: ['happy', 'upbeat', 'cheerful', 'joyful', 'positive'],
      sad: ['sad', 'melancholy', 'emotional', 'slow', 'heartbreak'],
      energetic: [
        'energetic',
        'pump up',
        'workout',
        'high energy',
        'motivation',
      ],
      calm: ['calm', 'relaxing', 'chill', 'peaceful', 'ambient'],
      angry: ['angry', 'aggressive', 'metal', 'punk', 'rage'],
      romantic: ['romantic', 'love', 'slow dance', 'valentine', 'intimate'],
      nostalgic: ['nostalgic', 'throwback', 'classic', 'memories', 'vintage'],
      excited: ['excited', 'party', 'celebration', 'fun', 'uplifting'],
    };

    const lowerMood = mood.toLowerCase();
    return moodMap[lowerMood] || ['music', 'playlist', 'good vibes'];
  }

  /**
   * Select the best playlist from search results
   */
  private static selectBestPlaylist(
    playlists: SpotifyPlaylist[],
    mood: string
  ): SpotifyPlaylist {
    // Score playlists based on various factors
    const scoredPlaylists = playlists.map((playlist) => {
      let score = 0;

      // More tracks = better
      score += Math.min(playlist.tracks.total / 10, 10);

      // Mood keyword in name = better
      const moodKeywords = this.getMoodKeywords(mood);
      const nameContainsMood = moodKeywords.some((keyword) =>
        playlist.name.toLowerCase().includes(keyword.toLowerCase())
      );
      if (nameContainsMood) score += 5;

      // Has description = better
      if (playlist.description) score += 2;

      // Has image = better
      if (playlist.images && playlist.images.length > 0) score += 1;

      return { playlist, score };
    });

    // Sort by score and return the best one
    scoredPlaylists.sort((a, b) => b.score - a.score);
    return scoredPlaylists[0].playlist;
  }

  /**
   * Check if the access token is valid
   */
  static async checkTokenValidity(): Promise<boolean> {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        },
      });

      if (response.ok) {
        console.log('✅ Spotify token is valid');
        return true;
      } else {
        console.log('❌ Spotify token is invalid or expired');
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}
