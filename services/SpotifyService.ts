/**
 * SpotifyService - Handles Spotify playlist generation based on mood
 *
 * This service integrates with Spotify Web API to find real playlists
 * based on detected mood from photos
 */

import { SpotifyAuthService } from './SpotifyAuthService';

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
  followers: {
    total: number;
  };
}

export interface SpotifySearchResponse {
  playlists: {
    items: SpotifyPlaylist[];
    total: number;
  };
}

export class SpotifyService {
  // Mood to genre/keyword mapping for better search results
  private static MOOD_TO_SEARCH_TERMS: { [key: string]: string[] } = {
    Happy: ['happy', 'upbeat', 'cheerful', 'feel good', 'positive vibes'],
    Sad: ['sad', 'melancholy', 'heartbreak', 'emotional', 'crying'],
    Calm: ['calm', 'relaxing', 'peaceful', 'chill', 'ambient'],
    Energetic: ['energetic', 'workout', 'pump up', 'high energy', 'motivation'],
    Excited: ['party', 'dance', 'celebration', 'hype', 'uplifting'],
    Peaceful: ['peaceful', 'meditation', 'zen', 'tranquil', 'serene'],
  };

  /**
   * Get a Spotify playlist URI based on detected mood using real API
   * @param mood - The detected mood category
   * @returns Promise<string> - Spotify playlist URI
   */
  static async getPlaylistForMood(mood: string): Promise<string> {
    try {
      console.log(`Finding playlist for mood: ${mood}`);

      // Get access token
      const accessToken = await SpotifyAuthService.getAccessToken();
      if (!accessToken) {
        console.warn(
          'No Spotify access token available, user needs to authenticate'
        );
        throw new Error('Authentication required');
      }

      // Search for playlists based on mood
      const playlists = await this.searchPlaylistsByMood(mood, accessToken);

      if (playlists.length === 0) {
        console.warn(`No playlists found for mood: ${mood}`);
        throw new Error('No playlists found for this mood');
      }

      // Select the best playlist based on popularity and relevance
      const bestPlaylist = this.selectBestPlaylist(playlists, mood);

      console.log(
        `Selected playlist: ${bestPlaylist.name} (${bestPlaylist.id})`
      );
      return bestPlaylist.id;
    } catch (error) {
      console.error('Spotify API error:', error);

      // Fallback to authentication prompt or error handling
      if (error.message === 'Authentication required') {
        throw new Error(
          'Please authenticate with Spotify to get personalized playlists'
        );
      }

      throw new Error('Failed to get playlist for mood');
    }
  }

  /**
   * Search for playlists on Spotify based on mood
   * @param mood - The mood to search for
   * @param accessToken - Spotify access token
   * @returns Promise<SpotifyPlaylist[]>
   */
  private static async searchPlaylistsByMood(
    mood: string,
    accessToken: string
  ): Promise<SpotifyPlaylist[]> {
    try {
      const searchTerms = this.MOOD_TO_SEARCH_TERMS[mood] || [
        mood.toLowerCase(),
      ];
      const allPlaylists: SpotifyPlaylist[] = [];

      // Search using multiple terms to get diverse results
      for (const term of searchTerms.slice(0, 3)) {
        // Limit to first 3 terms to avoid too many requests
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            term
          )}&type=playlist&limit=10&market=US`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(`Search failed for term "${term}": ${response.status}`);
          continue;
        }

        const data: SpotifySearchResponse = await response.json();
        allPlaylists.push(...data.playlists.items);
      }

      // Remove duplicates and filter
      const uniquePlaylists = this.removeDuplicatePlaylists(allPlaylists);
      return this.filterPlaylistsByQuality(uniquePlaylists);
    } catch (error) {
      console.error('Error searching playlists:', error);
      return [];
    }
  }

  /**
   * Remove duplicate playlists from search results
   * @param playlists - Array of playlists
   * @returns SpotifyPlaylist[] - Unique playlists
   */
  private static removeDuplicatePlaylists(
    playlists: SpotifyPlaylist[]
  ): SpotifyPlaylist[] {
    const seen = new Set<string>();
    return playlists.filter((playlist) => {
      if (seen.has(playlist.id)) {
        return false;
      }
      seen.add(playlist.id);
      return true;
    });
  }

  /**
   * Filter playlists by quality metrics
   * @param playlists - Array of playlists to filter
   * @returns SpotifyPlaylist[] - Filtered playlists
   */
  private static filterPlaylistsByQuality(
    playlists: SpotifyPlaylist[]
  ): SpotifyPlaylist[] {
    return playlists.filter(
      (playlist) =>
        playlist.tracks.total >= 15 && // Minimum track count
        playlist.tracks.total <= 200 && // Maximum track count (avoid huge playlists)
        playlist.name && // Must have a name
        !playlist.name.toLowerCase().includes('test') // Filter out test playlists
    );
  }

  /**
   * Select the best playlist from search results using relevance and popularity
   * @param playlists - Array of playlist objects from Spotify API
   * @param mood - Target mood for filtering
   * @returns SpotifyPlaylist - Best matching playlist
   */
  private static selectBestPlaylist(
    playlists: SpotifyPlaylist[],
    mood: string
  ): SpotifyPlaylist {
    if (playlists.length === 0) {
      throw new Error('No playlists available for selection');
    }

    // Score playlists based on relevance and popularity
    const scoredPlaylists = playlists.map((playlist) => ({
      playlist,
      score: this.calculatePlaylistScore(playlist, mood),
    }));

    // Sort by score (highest first) and return the best one
    scoredPlaylists.sort((a, b) => b.score - a.score);
    return scoredPlaylists[0].playlist;
  }

  /**
   * Calculate a relevance score for a playlist based on mood
   * @param playlist - The playlist to score
   * @param mood - The target mood
   * @returns number - Relevance score
   */
  private static calculatePlaylistScore(
    playlist: SpotifyPlaylist,
    mood: string
  ): number {
    let score = 0;

    // Base popularity score (logarithmic to prevent huge playlists from dominating)
    score += Math.log10(Math.max(playlist.followers?.total || 1, 1)) * 10;

    // Track count preference (50-100 tracks is ideal)
    const trackCount = playlist.tracks.total;
    if (trackCount >= 30 && trackCount <= 100) {
      score += 20;
    } else if (trackCount >= 15 && trackCount <= 150) {
      score += 10;
    }

    // Name relevance scoring
    const nameRelevance = this.calculateNameRelevance(playlist.name, mood);
    score += nameRelevance * 30;

    // Description relevance scoring
    if (playlist.description) {
      const descRelevance = this.calculateNameRelevance(
        playlist.description,
        mood
      );
      score += descRelevance * 15;
    }

    // Prefer playlists with images (indicates better curation)
    if (playlist.images && playlist.images.length > 0) {
      score += 5;
    }

    return score;
  }

  /**
   * Calculate how relevant a playlist name/description is to the mood
   * @param text - Text to analyze
   * @param mood - Target mood
   * @returns number - Relevance score (0-1)
   */
  private static calculateNameRelevance(text: string, mood: string): number {
    if (!text) return 0;

    const lowerText = text.toLowerCase();
    const searchTerms = this.MOOD_TO_SEARCH_TERMS[mood] || [mood.toLowerCase()];

    let relevanceScore = 0;
    let matchCount = 0;

    searchTerms.forEach((term) => {
      if (lowerText.includes(term.toLowerCase())) {
        matchCount++;
        // Give higher score for exact matches
        if (lowerText === term.toLowerCase()) {
          relevanceScore += 1;
        } else {
          relevanceScore += 0.5;
        }
      }
    });

    // Normalize by the number of search terms
    return Math.min(relevanceScore / searchTerms.length, 1);
  }

  /**
   * Get multiple playlist recommendations for a mood
   * @param mood - The detected mood category
   * @param count - Number of playlists to return (default: 3)
   * @returns Promise<string[]> - Array of Spotify playlist URIs
   */
  static async getMultiplePlaylistsForMood(
    mood: string,
    count: number = 3
  ): Promise<string[]> {
    try {
      const accessToken = await SpotifyAuthService.getAccessToken();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const playlists = await this.searchPlaylistsByMood(mood, accessToken);

      if (playlists.length === 0) {
        const singlePlaylist = await this.getPlaylistForMood(mood);
        return [singlePlaylist];
      }

      // Score and sort playlists
      const scoredPlaylists = playlists.map((playlist) => ({
        playlist,
        score: this.calculatePlaylistScore(playlist, mood),
      }));

      scoredPlaylists.sort((a, b) => b.score - a.score);

      // Return top playlists
      const topPlaylists = scoredPlaylists
        .slice(0, Math.min(count, scoredPlaylists.length))
        .map((item) => item.playlist.id);

      return topPlaylists;
    } catch (error) {
      console.error('Failed to get multiple playlists:', error);
      throw error;
    }
  }

  /**
   * Check if Spotify service is available and user is authenticated
   * @returns Promise<boolean>
   */
  static async isServiceAvailable(): Promise<boolean> {
    try {
      const accessToken = await SpotifyAuthService.getAccessToken();
      return !!accessToken;
    } catch {
      return false;
    }
  }

  /**
   * Get mood categories supported by the service
   * @returns string[] - Array of supported mood categories
   */
  static getSupportedMoods(): string[] {
    return Object.keys(this.MOOD_TO_SEARCH_TERMS);
  }

  /**
   * Trigger Spotify authentication flow
   * @returns Promise<boolean> - Success status
   */
  static async authenticate(): Promise<boolean> {
    try {
      const tokens = await SpotifyAuthService.authenticate();
      return !!tokens;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * Logout from Spotify
   */
  static async logout(): Promise<void> {
    await SpotifyAuthService.logout();
  }

  /**
   * Utility function to simulate network delay (kept for backward compatibility)
   * @param ms - Milliseconds to delay
   * @returns Promise<void>
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
