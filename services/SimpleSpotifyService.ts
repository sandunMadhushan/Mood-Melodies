/**
 * Simple Spotify service using a static access token
 * This bypasses the OAuth redirect URI issues
 */

export interface Playlist {
  id: string;
  name: string;
  description: string;
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  tracks: {
    total: number;
  };
}

export class SimpleSpotifyService {
  // Use the token you got from Postman here
  private static ACCESS_TOKEN =
    'BQAVmTVScEUx6a3cRlf4dhB6oShjKUzIjkBLLqlkAjdK57c3sCJ8qd2Hfl93aV6J9JAxyTRKO6KxjpouhpFUvRDF-q0VYWfxjeB7zVx7h6SmHqMGrS-tDxqaiX9Xgg68-gCB5VcKjqM';

  /**
   * Update the access token when you get a new one from Postman
   */
  static updateToken(newToken: string): void {
    this.ACCESS_TOKEN = newToken;
  }

  /**
   * Get playlist recommendations based on mood
   */
  static async getPlaylistForMood(mood: string): Promise<Playlist | null> {
    try {
      console.log(`🎵 Searching Spotify for ${mood} playlists...`);

      // Map moods to search keywords
      const moodKeywords = {
        happy: 'happy upbeat feel good',
        sad: 'sad melancholy emotional',
        energetic: 'energetic workout pump up',
        calm: 'calm relaxing chill',
        angry: 'angry rock metal intense',
        romantic: 'romantic love ballads',
        nostalgic: 'nostalgic throwback classic',
      };

      const searchQuery =
        moodKeywords[mood.toLowerCase() as keyof typeof moodKeywords] || mood;

      // Search for playlists
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchQuery
        )}&type=playlist&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          'Spotify API error:',
          response.status,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      const playlists = data.playlists?.items || [];

      if (playlists.length === 0) {
        console.log('No playlists found for mood:', mood);
        return null;
      }

      // Filter and score playlists
      const scoredPlaylists = playlists
        .filter((playlist: any) => playlist && playlist.tracks?.total > 10) // At least 10 tracks
        .map((playlist: any) => ({
          ...playlist,
          score: this.calculatePlaylistScore(playlist, mood),
        }))
        .sort((a: any, b: any) => b.score - a.score);

      const bestPlaylist = scoredPlaylists[0];

      if (bestPlaylist) {
        console.log(
          `✅ Found perfect ${mood} playlist: "${bestPlaylist.name}"`
        );
        return bestPlaylist;
      }

      return null;
    } catch (error) {
      console.error('Error fetching Spotify playlist:', error);
      return null;
    }
  }

  /**
   * Calculate playlist relevance score
   */
  private static calculatePlaylistScore(playlist: any, mood: string): number {
    let score = 0;
    const name = playlist.name?.toLowerCase() || '';
    const description = playlist.description?.toLowerCase() || '';
    const moodLower = mood.toLowerCase();

    // Exact mood match
    if (name.includes(moodLower)) score += 50;
    if (description.includes(moodLower)) score += 30;

    // Related keywords
    const moodSynonyms: { [key: string]: string[] } = {
      happy: ['happy', 'upbeat', 'feel good', 'positive', 'joyful', 'cheerful'],
      sad: ['sad', 'melancholy', 'emotional', 'heartbreak', 'blue', 'tears'],
      energetic: [
        'energetic',
        'workout',
        'pump up',
        'high energy',
        'intense',
        'power',
      ],
      calm: ['calm', 'relaxing', 'chill', 'peaceful', 'ambient', 'zen'],
      angry: ['angry', 'rage', 'intense', 'aggressive', 'metal', 'rock'],
      romantic: ['romantic', 'love', 'romance', 'valentine', 'couples'],
      nostalgic: ['nostalgic', 'throwback', 'classic', 'retro', 'old school'],
    };

    const synonyms = moodSynonyms[moodLower] || [moodLower];
    synonyms.forEach((synonym) => {
      if (name.includes(synonym)) score += 20;
      if (description.includes(synonym)) score += 10;
    });

    // Popularity boost
    if (playlist.followers?.total > 1000) score += 10;
    if (playlist.followers?.total > 10000) score += 5;

    // Track count preference (not too short, not too long)
    const trackCount = playlist.tracks?.total || 0;
    if (trackCount >= 20 && trackCount <= 100) score += 15;
    else if (trackCount > 100) score += 5;

    return score;
  }
}
