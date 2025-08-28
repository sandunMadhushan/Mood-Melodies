# 🎵 Mood Melodies

**Discover your perfect soundtrack based on your current mood**

Mood Melodies is a React Native app built with Expo that analyzes photos to detect emotions and recommends personalized Spotify playlists. Simply take a photo or select one from your gallery, and let AI find the perfect music to match your vibe!

## ✨ Features

- 📸 **Photo Capture & Selection**: Take new photos or choose from your gallery
- 🧠 **AI Mood Detection**: Advanced emotion analysis from facial expressions
- 🎶 **Spotify Integration**: Get curated playlists based on detected mood
- 📱 **Cross-Platform**: Works on iOS and Android
- 🔒 **Privacy-First**: Photos are analyzed locally and never stored
- 🎨 **Beautiful UI**: Clean, modern interface with mood-based color themes

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with tabs navigation
- **UI Components**: Custom components with Lucide React Native icons
- **Image Processing**: Expo Image Picker & Camera
- **API Integration**: Spotify Web API
- **Storage**: Expo SecureStore for token management
- **Authentication**: Expo AuthSession for OAuth flows
- **TypeScript**: Full type safety throughout the app

## 📱 App Structure

```
app/
├── _layout.tsx           # Root layout with navigation
├── index.tsx            # Welcome screen (unused)
├── +not-found.tsx       # 404 error screen
└── (tabs)/              # Tab-based navigation
    ├── _layout.tsx      # Tab navigation layout
    ├── index.tsx        # Home screen (main entry)
    ├── camera.tsx       # Camera tab (placeholder)
    └── results.tsx      # Results & playlist screen

services/
├── ImageService.ts           # Photo capture & gallery selection
├── VisionService.ts          # AI mood detection (mock implementation)
├── SimpleSpotifyService.ts   # Direct Spotify API integration
├── SpotifyService.ts         # Full OAuth Spotify service
├── SpotifyAuthService.ts     # OAuth authentication flow
└── [Other service files]

hooks/
└── useFrameworkReady.ts # Framework initialization hook
```

## 🎭 Supported Moods

The app detects and maps the following emotions to music:

- 😊 **Happy** → Upbeat, feel-good tracks
- 😢 **Sad** → Melancholy, emotional ballads  
- 😌 **Calm** → Relaxing, chill ambient music
- 🚀 **Energetic** → High-energy workout music
- 🤩 **Excited** → Party, dance, celebration tracks
- ☮️ **Peaceful** → Meditation, zen, tranquil sounds

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### 1. Clone the Repository

```bash
git clone https://github.com/sandunMadhushan/Mood-Melodies.git
cd Mood-Melodies
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Spotify API Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your Client ID and Client Secret
4. Update `app.json` with your credentials:

```json
{
  "expo": {
    "extra": {
      "spotifyClientId": "YOUR_CLIENT_ID",
      "spotifyClientSecret": "YOUR_CLIENT_SECRET"
    }
  }
}
```

### 4. Configure Redirect URI

In your Spotify app settings, add the redirect URI:
```
moodmelodies://auth
```

### 5. Run the App

```bash
# Start the development server
npm run dev
# or
yarn dev

# Run on specific platform
expo start --ios
expo start --android
```

## 🔧 Configuration

### Environment Variables

The app uses Expo Constants to load configuration from `app.json`:

```json
{
  "expo": {
    "extra": {
      "spotifyClientId": "your_spotify_client_id",
      "spotifyClientSecret": "your_spotify_client_secret"
    }
  }
}
```

### Spotify Token Management

For development, you can use a static token by updating `SimpleSpotifyService.ts`:

1. Get a token from Spotify API using Postman:
   ```bash
   POST https://accounts.spotify.com/api/token
   Authorization: Basic <base64(client_id:client_secret)>
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=client_credentials
   ```

2. Update the token in the service:
   ```typescript
   private static ACCESS_TOKEN = 'your_access_token_here';
   ```

See `HOW_TO_UPDATE_TOKEN.md` for detailed instructions.

## 🏗️ Architecture

### Service Layer

**ImageService**: Handles camera permissions and photo selection
- Camera capture with aspect ratio 1:1
- Gallery selection with editing capabilities
- Image validation and metadata extraction

**VisionService**: Mock AI emotion detection
- Simulates real AI APIs (Google Vision, AWS Rekognition)
- Returns random mood categories for demo purposes
- Includes confidence scoring and error handling

**SpotifyService**: Full OAuth implementation
- Complete Spotify Web API integration
- Token refresh and management
- Playlist search and scoring algorithms

**SimpleSpotifyService**: Direct API approach
- Uses static access tokens for development
- Simplified playlist retrieval
- Mood-to-genre mapping

### Component Architecture

- **Tab Navigation**: Bottom tabs for easy navigation
- **Responsive Design**: Adapts to different screen sizes
- **Error Handling**: Comprehensive error states and recovery
- **Loading States**: Smooth transitions and feedback

## 🎨 UI/UX Design

### Design System

- **Primary Color**: Purple (#8B5CF6)
- **Typography**: System fonts with clear hierarchy
- **Spacing**: Consistent 4px grid system
- **Shadows**: Subtle elevation for cards and buttons

### User Flow

1. **Home Screen**: Choose to capture or select photo
2. **Loading**: AI analyzes the photo for emotions
3. **Results**: Display detected mood with confidence
4. **Playlist**: Show matched Spotify playlist
5. **Action**: Open in Spotify app or continue

## 🔐 Privacy & Security

- **Local Processing**: Mood analysis happens on device
- **No Photo Storage**: Images are never saved or uploaded
- **Secure Tokens**: OAuth tokens stored in device keychain
- **Permission Handling**: Clear permission requests and explanations

## 📱 Platform Support

### iOS
- iOS 13.0+
- iPhone and iPad support
- Native camera integration
- Deep linking to Spotify app

### Android  
- Android 6.0+ (API 23)
- Adaptive icon support
- Camera and gallery permissions
- Intent handling for Spotify

### Web
- Progressive Web App capabilities
- Metro bundler for web deployment
- Browser-based camera access

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start Expo development server
npm run build:web    # Build for web deployment
npm run lint         # Run ESLint

# Platform specific
expo start --ios     # iOS simulator
expo start --android # Android emulator
expo start --web     # Web browser
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automated code formatting
- **Path Mapping**: Clean imports with `@/` prefix

### Testing

The app includes comprehensive error handling and validation:
- Image format validation
- Network error recovery
- Permission handling
- Token expiration management

## 🚧 Future Enhancements

### Planned Features

- [ ] **Real AI Integration**: Connect to actual emotion detection APIs
- [ ] **Music Streaming**: Direct playback within the app
- [ ] **Playlist Creation**: Generate custom playlists based on mood
- [ ] **Social Sharing**: Share mood results and playlists
- [ ] **History**: Track mood patterns over time
- [ ] **Custom Moods**: User-defined emotion categories
- [ ] **Multiple Photos**: Analyze photo galleries or albums
- [ ] **Real-time Camera**: Live mood detection from camera feed

### Technical Improvements

- [ ] **Offline Mode**: Cache playlists for offline access
- [ ] **Push Notifications**: Daily mood check-ins
- [ ] **Analytics**: Usage patterns and mood insights
- [ ] **Performance**: Image optimization and caching
- [ ] **Accessibility**: Screen reader and voice control support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Add TypeScript types for all new code
- Include error handling for all external API calls
- Test on both iOS and Android platforms
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music data
- [Lucide React Native](https://lucide.dev/) for beautiful icons
- [React Navigation](https://reactnavigation.org/) for navigation

## 📞 Support

For support, email sandunmadhushan@example.com or create an issue on GitHub.

---

**Made with ❤️ by [Sandun Madhushan](https://github.com/sandunMadhushan)**
