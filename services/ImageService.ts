import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export class ImageService {
  /**
   * Request camera permissions and capture a photo
   * @returns Promise<ImagePicker.ImagePickerResult | null>
   */
  static async captureImage(): Promise<ImagePicker.ImagePickerAsset | null> {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to capture photos for mood analysis.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0];
      }

      return null;
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert(
        'Camera Error',
        'Failed to capture image. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  /**
   * Request media library permissions and select a photo
   * @returns Promise<ImagePicker.ImagePickerResult | null>
   */
  static async selectFromGallery(): Promise<ImagePicker.ImagePickerAsset | null> {
    try {
      // Request media library permissions
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (libraryPermission.status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'Please allow gallery access to select photos for mood analysis.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0];
      }

      return null;
    } catch (error) {
      console.error('Gallery selection error:', error);
      Alert.alert(
        'Gallery Error',
        'Failed to select image. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  /**
   * Validate image file for processing
   * @param imageUri - The URI of the image to validate
   * @returns boolean
   */
  static validateImageFile(imageUri: string): boolean {
    if (!imageUri) return false;
    
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerUri = imageUri.toLowerCase();
    
    return supportedFormats.some(format => lowerUri.includes(format));
  }

  /**
   * Get image dimensions and file size info
   * @param imageUri - The URI of the image
   * @returns Promise<object>
   */
  static async getImageInfo(imageUri: string) {
    try {
      // In a real implementation, you would get actual file info
      // For now, return mock data
      return {
        width: 800,
        height: 800,
        fileSize: Math.floor(Math.random() * 2000000) + 500000, // 0.5-2.5MB
        format: 'jpeg',
      };
    } catch (error) {
      console.error('Failed to get image info:', error);
      return null;
    }
  }
}