import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { ImageService } from '@/services/ImageService';

export default function HomeScreen() {
  const handleCameraCapture = async () => {
    try {
      const result = await ImageService.captureImage();
      if (result) {
        router.push({
          pathname: '/(tabs)/results',
          params: { imageUri: result.uri },
        });
      }
    } catch (error) {
      console.error('Camera capture error:', error);
    }
  };

  const handleGallerySelect = async () => {
    try {
      const result = await ImageService.selectFromGallery();
      if (result) {
        router.push({
          pathname: '/(tabs)/results',
          params: { imageUri: result.uri },
        });
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Mood Melodies</Text>
        <Text style={styles.subtitle}>
          Discover your perfect soundtrack based on your current mood
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCameraCapture}
          activeOpacity={0.8}
        >
          <Camera size={24} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Capture Your Mood</Text>
          <Text style={styles.buttonSubtext}>Take a new photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleGallerySelect}
          activeOpacity={0.8}
        >
          <ImageIcon size={24} color="#8B5CF6" style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Analyze a Photo</Text>
          <Text style={styles.buttonSubtext}>Choose from gallery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your photos are analyzed locally and never stored
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  buttonIcon: {
    marginBottom: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});