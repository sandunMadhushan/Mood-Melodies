import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export class SpotifyAuthService {
  // Credentials loaded from Expo Constants (app.json extra config)
  private static CLIENT_ID = Constants.expoConfig?.extra?.spotifyClientId;
  private static CLIENT_SECRET =
    Constants.expoConfig?.extra?.spotifyClientSecret;
  private static REDIRECT_URI = 'moodmelodies://auth'; // Fixed redirect URI

  /**
   * Debug method to log the redirect URI being used
   */
  static logRedirectUri(): void {
    console.log('🔗 Redirect URI being used:', this.REDIRECT_URI);
  }

  private static SCOPES = [
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-read-private',
    'user-read-email',
  ];

  /**
   * Validate that Spotify credentials are properly configured
   * @throws Error if configuration is invalid
   */
  private static validateConfig(): void {
    if (!this.CLIENT_ID || this.CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID') {
      throw new Error(
        'SPOTIFY_CLIENT_ID is not configured. Please check your app.json extra config.'
      );
    }

    if (
      !this.CLIENT_SECRET ||
      this.CLIENT_SECRET === 'YOUR_SPOTIFY_CLIENT_SECRET'
    ) {
      throw new Error(
        'SPOTIFY_CLIENT_SECRET is not configured. Please check your app.json extra config.'
      );
    }

    console.log('✅ Spotify configuration loaded successfully');
  }

  /**
   * Authenticate user with Spotify using OAuth 2.0
   * @returns Promise<SpotifyTokens | null>
   */
  static async authenticate(): Promise<SpotifyTokens | null> {
    try {
      // Validate configuration first
      this.validateConfig();

      // Debug: Log the redirect URI
      this.logRedirectUri();

      // Check if we already have valid tokens
      const existingTokens = await this.getStoredTokens();
      if (
        existingTokens &&
        (await this.isTokenValid(existingTokens.access_token))
      ) {
        return existingTokens;
      }

      // If tokens are expired, try to refresh
      if (existingTokens?.refresh_token) {
        const refreshedTokens = await this.refreshAccessToken(
          existingTokens.refresh_token
        );
        if (refreshedTokens) {
          await this.storeTokens(refreshedTokens);
          return refreshedTokens;
        }
      }

      // Create auth request
      const request = new AuthSession.AuthRequest({
        clientId: this.CLIENT_ID,
        scopes: this.SCOPES,
        usePKCE: false,
        redirectUri: this.REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      });

      if (result.type === 'success' && result.params.code) {
        const tokens = await this.exchangeCodeForTokens(result.params.code);
        if (tokens) {
          await this.storeTokens(tokens);
          return tokens;
        }
      }

      return null;
    } catch (error) {
      console.error('Spotify authentication error:', error);
      Alert.alert(
        'Authentication Error',
        'Failed to authenticate with Spotify'
      );
      return null;
    }
  }

  /**
   * Exchange authorization code for access tokens
   * @param code - Authorization code from Spotify
   * @returns Promise<SpotifyTokens | null>
   */
  private static async exchangeCodeForTokens(
    code: string
  ): Promise<SpotifyTokens | null> {
    try {
      this.validateConfig();

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(
            `${this.CLIENT_ID}:${this.CLIENT_SECRET}`
          )}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.REDIRECT_URI,
        }).toString(),
      });

      if (response.ok) {
        const tokens: SpotifyTokens = await response.json();
        return tokens;
      }

      throw new Error(`Token exchange failed: ${response.status}`);
    } catch (error) {
      console.error('Token exchange error:', error);
      return null;
    }
  }

  /**
   * Refresh expired access token using refresh token
   * @param refreshToken - The refresh token
   * @returns Promise<SpotifyTokens | null>
   */
  private static async refreshAccessToken(
    refreshToken: string
  ): Promise<SpotifyTokens | null> {
    try {
      this.validateConfig();

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(
            `${this.CLIENT_ID}:${this.CLIENT_SECRET}`
          )}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      });

      if (response.ok) {
        const tokens: SpotifyTokens = await response.json();
        // Preserve the refresh token if not provided in response
        if (!tokens.refresh_token) {
          tokens.refresh_token = refreshToken;
        }
        return tokens;
      }

      throw new Error(`Token refresh failed: ${response.status}`);
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  /**
   * Check if access token is still valid
   * @param accessToken - The access token to validate
   * @returns Promise<boolean>
   */
  private static async isTokenValid(accessToken: string): Promise<boolean> {
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

  /**
   * Store tokens securely
   * @param tokens - The tokens to store
   */
  private static async storeTokens(tokens: SpotifyTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync('spotify_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Get stored tokens from secure storage
   * @returns Promise<SpotifyTokens | null>
   */
  private static async getStoredTokens(): Promise<SpotifyTokens | null> {
    try {
      const tokens = await SecureStore.getItemAsync('spotify_tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Clear stored authentication tokens
   */
  static async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('spotify_tokens');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Get current access token
   * @returns Promise<string | null>
   */
  static async getAccessToken(): Promise<string | null> {
    const tokens = await this.authenticate();
    return tokens?.access_token || null;
  }
}
