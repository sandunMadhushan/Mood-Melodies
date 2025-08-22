/**
 * Environment Configuration Utility
 * Helper functions to validate and debug environment setup
 */

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';

export class EnvConfig {
  /**
   * Check if all required environment variables are configured
   * @returns boolean - True if all required vars are set
   */
  static isConfigured(): boolean {
    return !!(
      SPOTIFY_CLIENT_ID &&
      SPOTIFY_CLIENT_SECRET &&
      SPOTIFY_CLIENT_ID !== 'YOUR_SPOTIFY_CLIENT_ID' &&
      SPOTIFY_CLIENT_SECRET !== 'YOUR_SPOTIFY_CLIENT_SECRET'
    );
  }

  /**
   * Get configuration status for debugging
   * @returns object - Configuration status object
   */
  static getConfigStatus() {
    return {
      hasClientId: !!SPOTIFY_CLIENT_ID,
      hasClientSecret: !!SPOTIFY_CLIENT_SECRET,
      clientIdValid: SPOTIFY_CLIENT_ID !== 'YOUR_SPOTIFY_CLIENT_ID',
      clientSecretValid: SPOTIFY_CLIENT_SECRET !== 'YOUR_SPOTIFY_CLIENT_SECRET',
      isFullyConfigured: this.isConfigured(),
    };
  }

  /**
   * Print configuration status to console (for debugging)
   */
  static logConfigStatus(): void {
    const status = this.getConfigStatus();
    console.log('🔧 Environment Configuration Status:');
    console.log(`   Client ID configured: ${status.hasClientId ? '✅' : '❌'}`);
    console.log(
      `   Client Secret configured: ${status.hasClientSecret ? '✅' : '❌'}`
    );
    console.log(`   Client ID valid: ${status.clientIdValid ? '✅' : '❌'}`);
    console.log(
      `   Client Secret valid: ${status.clientSecretValid ? '✅' : '❌'}`
    );
    console.log(
      `   Fully configured: ${status.isFullyConfigured ? '✅' : '❌'}`
    );

    if (!status.isFullyConfigured) {
      console.log(
        '⚠️  Please check your .env file and restart the development server'
      );
    }
  }

  /**
   * Get masked client ID for safe logging (shows only first/last 4 characters)
   * @returns string - Masked client ID
   */
  static getMaskedClientId(): string {
    if (!SPOTIFY_CLIENT_ID || SPOTIFY_CLIENT_ID.length < 8) {
      return 'Not configured';
    }

    const start = SPOTIFY_CLIENT_ID.slice(0, 4);
    const end = SPOTIFY_CLIENT_ID.slice(-4);
    const middle = '*'.repeat(SPOTIFY_CLIENT_ID.length - 8);

    return `${start}${middle}${end}`;
  }
}
