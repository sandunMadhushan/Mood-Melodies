/**
 * Real AI Vision Service using Google Cloud Vision API
 * Replace the mock VisionService with this for real mood detection
 */

export interface EmotionScores {
  joy: number;
  sorrow: number;
  anger: number;
  surprise: number;
  under_exposed: number;
  blurred: number;
  headwear: number;
}

export class RealVisionService {
  // Replace with your Google Cloud API key
  private static API_KEY = 'YOUR_GOOGLE_CLOUD_API_KEY';

  /**
   * Analyze an image using Google Cloud Vision API for real emotion detection
   * @param imageUri - The URI of the image to analyze
   * @returns Promise<string> - The detected mood category
   */
  static async analyzeImage(imageUri: string): Promise<string> {
    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);

      // Call Google Cloud Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: 'FACE_DETECTION',
                    maxResults: 1,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.responses[0]?.faceAnnotations?.[0]) {
        const emotions = data.responses[0].faceAnnotations[0];
        return this.mapEmotionsToMood(emotions);
      } else {
        // No face detected, analyze general image mood
        return this.analyzeGeneralImageMood(base64Image);
      }
    } catch (error) {
      console.error('Vision API error:', error);
      throw new Error('Failed to analyze image mood');
    }
  }

  /**
   * Convert image URI to base64 string
   * @param imageUri - The image URI
   * @returns Promise<string> - Base64 encoded image
   */
  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to convert image to base64');
    }
  }

  /**
   * Map Google Cloud Vision emotions to mood categories
   * @param emotions - Emotion data from Google Cloud Vision
   * @returns string - Mapped mood category
   */
  private static mapEmotionsToMood(emotions: any): string {
    const likelihoods = {
      VERY_UNLIKELY: 0,
      UNLIKELY: 1,
      POSSIBLE: 2,
      LIKELY: 3,
      VERY_LIKELY: 4,
    };

    const joyScore = likelihoods[emotions.joyLikelihood] || 0;
    const sorrowScore = likelihoods[emotions.sorrowLikelihood] || 0;
    const angerScore = likelihoods[emotions.angerLikelihood] || 0;
    const surpriseScore = likelihoods[emotions.surpriseLikelihood] || 0;

    // Determine dominant emotion
    if (joyScore >= 3) return 'Happy';
    if (sorrowScore >= 3) return 'Sad';
    if (angerScore >= 3) return 'Energetic';
    if (surpriseScore >= 3) return 'Excited';

    // For lower confidence or neutral expressions
    if (joyScore >= 2) return 'Happy';
    if (sorrowScore >= 2) return 'Calm';

    // Default to peaceful for neutral expressions
    return 'Peaceful';
  }

  /**
   * Analyze general image mood when no faces are detected
   * @param base64Image - Base64 encoded image
   * @returns Promise<string> - Detected mood
   */
  private static async analyzeGeneralImageMood(
    base64Image: string
  ): Promise<string> {
    try {
      // Use label detection to understand image content
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: 'LABEL_DETECTION',
                    maxResults: 10,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Label detection error: ${response.status}`);
      }

      const data = await response.json();
      const labels = data.responses[0]?.labelAnnotations || [];

      // Map image content to moods
      return this.mapLabelsToMood(labels);
    } catch (error) {
      console.error('Label detection error:', error);
      return 'Calm'; // Default fallback
    }
  }

  /**
   * Map image labels to mood categories
   * @param labels - Label annotations from Google Cloud Vision
   * @returns string - Mapped mood category
   */
  private static mapLabelsToMood(labels: any[]): string {
    const labelText = labels
      .map((label) => label.description.toLowerCase())
      .join(' ');

    // Define mood keywords
    const moodKeywords = {
      Happy: [
        'party',
        'celebration',
        'smile',
        'fun',
        'joy',
        'bright',
        'colorful',
      ],
      Energetic: ['sport', 'exercise', 'running', 'dance', 'active', 'motion'],
      Peaceful: [
        'nature',
        'landscape',
        'sunset',
        'beach',
        'mountain',
        'flower',
        'tree',
      ],
      Calm: ['water', 'sky', 'blue', 'peaceful', 'quiet', 'serene'],
      Excited: [
        'concert',
        'festival',
        'crowd',
        'music',
        'stage',
        'performance',
      ],
      Sad: ['rain', 'dark', 'grey', 'alone', 'empty'],
    };

    // Score each mood based on keyword matches
    let bestMood = 'Calm';
    let bestScore = 0;

    Object.entries(moodKeywords).forEach(([mood, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (labelText.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMood = mood;
      }
    });

    return bestMood;
  }
}
