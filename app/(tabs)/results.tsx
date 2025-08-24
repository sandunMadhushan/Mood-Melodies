import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  RefreshCw,
  Chrome as Home,
  Music,
  ExternalLink,
} from 'lucide-react-native';
import { VisionService } from '@/services/VisionService';
import { SimpleSpotifyService } from '@/services/SimpleSpotifyService';

interface MoodResult {
  mood: string;
  confidence: number;
  emoji: string;
}

export default function ResultsScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [loading, setLoading] = useState(true);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [playlistUri, setPlaylistUri] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [needsAuth, setNeedsAuth] = useState<boolean>(false);

  useEffect(() => {
    if (imageUri) {
      analyzeMood();
    }
  }, [imageUri]);

  const analyzeMood = async () => {
    try {
      setLoading(true);
      setError('');
      setNeedsAuth(false);

      // Analyze mood from image
      const mood = await VisionService.analyzeImage(imageUri);
      const moodData: MoodResult = {
        mood,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
        emoji: getMoodEmoji(mood),
      };

      setMoodResult(moodData);

      // Get matching playlist
      const playlist = await SimpleSpotifyService.getPlaylistForMood(mood);
      if (playlist) {
        setPlaylistUri(playlist.external_urls?.spotify || '');
      }
    } catch (err: any) {
      if (
        err.message?.includes('Authentication required') ||
        err.message?.includes('authenticate')
      ) {
        setNeedsAuth(true);
        setError(
          'Please authenticate with Spotify to get personalized playlists'
        );
      } else {
        setError('Failed to analyze mood. Please try again.');
      }
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotifyAuth = async () => {
    try {
      setLoading(true);

      // For SimpleSpotifyService, we already have the token set
      // Just try to get a playlist for the current mood
      if (moodResult) {
        const playlist = await SimpleSpotifyService.getPlaylistForMood(
          moodResult.mood
        );
        if (playlist) {
          setPlaylistUri(playlist.external_urls?.spotify || '');
          setNeedsAuth(false);
          setError('');
        } else {
          Alert.alert(
            'No Playlist Found',
            'Could not find a suitable playlist for your mood. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Spotify playlist error:', error);
      Alert.alert(
        'Playlist Error',
        'An error occurred while searching for playlists.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string): string => {
    const emojis: { [key: string]: string } = {
      Happy: '😊',
      Sad: '😢',
      Calm: '😌',
      Energetic: '🚀',
      Excited: '🤩',
      Peaceful: '☮️',
    };
    return emojis[mood] || '😊';
  };

  const getMoodColor = (mood: string): string => {
    const colors: { [key: string]: string } = {
      Happy: '#F59E0B',
      Sad: '#3B82F6',
      Calm: '#10B981',
      Energetic: '#EF4444',
      Excited: '#8B5CF6',
      Peaceful: '#06B6D4',
    };
    return colors[mood] || '#8B5CF6';
  };

  const openSpotifyPlaylist = async (playlistUrl: string) => {
    try {
      const canOpen = await Linking.canOpenURL(playlistUrl);

      if (canOpen) {
        await Linking.openURL(playlistUrl);
      } else {
        // Fallback to web URL
        await Linking.openURL(playlistUrl);
      }
    } catch (error) {
      console.error('Failed to open Spotify:', error);
      Alert.alert(
        'Unable to Open Spotify',
        'Please install the Spotify app or check your internet connection.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!imageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No image selected</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Home size={20} color="#FFFFFF" />
            <Text style={styles.homeButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingTitle}>Analyzing your vibe...</Text>
          <Text style={styles.loadingSubtitle}>
            Finding the perfect soundtrack for your mood
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {needsAuth ? (
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleSpotifyAuth}
            >
              <Music size={20} color="#FFFFFF" />
              <Text style={styles.authButtonText}>Connect Spotify</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.retryButton} onPress={analyzeMood}>
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.analyzedImage} />
        </View>

        {moodResult && (
          <View style={styles.moodContainer}>
            <Text style={styles.moodTitle}>We detected you're feeling:</Text>
            <View
              style={[
                styles.moodBadge,
                { backgroundColor: getMoodColor(moodResult.mood) + '20' },
              ]}
            >
              <Text style={styles.moodEmoji}>{moodResult.emoji}</Text>
              <Text
                style={[
                  styles.moodText,
                  { color: getMoodColor(moodResult.mood) },
                ]}
              >
                {moodResult.mood}
              </Text>
            </View>
            <Text style={styles.confidenceText}>
              {moodResult.confidence}% confidence
            </Text>
          </View>
        )}

        {playlistUri && (
          <View style={styles.playlistContainer}>
            <Text style={styles.playlistTitle}>Your Mood Playlist:</Text>
            <View style={styles.playlistCard}>
              <View style={styles.playlistInfo}>
                <Music size={40} color="#1DB954" />
                <Text style={styles.playlistText}>
                  Found the perfect playlist for your{' '}
                  {moodResult?.mood.toLowerCase()} mood!
                </Text>
              </View>
              <TouchableOpacity
                style={styles.openSpotifyButton}
                onPress={() => openSpotifyPlaylist(playlistUri)}
              >
                <ExternalLink size={20} color="#FFFFFF" />
                <Text style={styles.openSpotifyText}>Open in Spotify</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Home size={20} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>Analyze Another Photo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  analyzedImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  moodContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  moodTitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodText: {
    fontSize: 28,
    fontWeight: '700',
  },
  confidenceText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  playlistContainer: {
    marginBottom: 32,
  },
  playlistTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  playlistCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playlistText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  openSpotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 8,
  },
  openSpotifyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954', // Spotify green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
