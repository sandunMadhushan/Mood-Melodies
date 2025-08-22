import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Camera as CameraIcon } from 'lucide-react-native';

export default function CameraTab() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CameraIcon size={64} color="#8B5CF6" />
        <Text style={styles.title}>Camera Features</Text>
        <Text style={styles.subtitle}>
          Use the Home tab to capture or select photos for mood analysis
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});