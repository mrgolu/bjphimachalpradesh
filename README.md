# BJP Himachal Pradesh Mobile App

A comprehensive mobile application for BJP Himachal Pradesh featuring news updates, live sessions, activities, meetings, and gallery management.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile devices with responsive design
- 🔴 **Live Sessions**: Interactive live streaming with scheduled sessions and auto-start
- 📰 **Social Media Integration**: Post management with WhatsApp, Telegram, Facebook, and Twitter sharing
- 📅 **Activities & Meetings**: Event management with detailed information and sharing capabilities
- 🖼️ **Gallery Management**: Photo and video upload with file upload and URL support
- 🔐 **Authentication**: Secure user authentication with Supabase
- 📱 **Native Mobile App**: Android APK generation with Capacitor

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom BJP theme colors
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Mobile**: Capacitor for Android APK
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Android Studio (for APK building)
- Java Development Kit (JDK) 11+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bjp-himachal-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

### Building for Production

1. Build the web app:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

### Building Android APK

1. Build the web app first:
```bash
npm run build
```

2. Sync with Capacitor:
```bash
npm run capacitor:sync
```

3. Open in Android Studio:
```bash
npm run capacitor:open
```

4. In Android Studio:
   - Wait for Gradle sync to complete
   - Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - The APK will be generated in `android/app/build/outputs/apk/debug/`

### Quick APK Build Commands

```bash
# Build and sync everything
npm run android:build

# Just sync Capacitor
npm run android:sync

# Open Android Studio
npm run android:open
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AdminPanel.tsx   # Admin dashboard for content management
│   ├── AuthButton.tsx   # Authentication button component
│   ├── AuthModal.tsx    # Login/signup modal
│   ├── GalleryAdminPanel.tsx  # Gallery management interface
│   ├── GalleryGrid.tsx  # Gallery display component
│   ├── LiveVideo.tsx    # Live streaming component
│   └── ...
├── pages/              # Page components
│   ├── Home.tsx        # Social media feed homepage
│   ├── Live.tsx        # Live sessions page
│   ├── Activities.tsx  # Activities listing
│   ├── Meetings.tsx    # Meetings with sharing
│   ├── Gallery.tsx     # Photo/video gallery
│   └── Admin.tsx       # Admin dashboard
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client configuration
└── types/              # TypeScript type definitions
```

## Database Schema

The app uses Supabase with the following main tables:

- **posts**: Social media posts with content and social links
- **activities**: Events and campaigns with dates and locations
- **meetings**: Meeting details with video links and attendees
- **gallery_items**: Photos and videos with categories and tags
- **live_sessions**: Live streaming sessions with scheduling

## Features in Detail

### Live Sessions
- **Scheduled Sessions**: Auto-start at designated times
- **Real-time Countdown**: Live countdown with seconds precision
- **Viewer Count**: Simulated real-time viewer tracking
- **Recording**: Built-in recording with download capability
- **Social Integration**: Auto-posting to social media when going live

### Gallery Management
- **File Upload**: Direct file upload with drag-and-drop support
- **URL Import**: Import media from external URLs
- **Categories**: Organized categorization system
- **Tags**: Searchable tag system
- **Responsive Grid**: Beautiful grid and list view modes

### Social Sharing
- **WhatsApp**: Direct sharing with formatted messages
- **Telegram**: Telegram sharing integration
- **Facebook**: Facebook post sharing
- **Twitter**: Twitter post sharing
- **Copy to Clipboard**: Fallback sharing option

### Mobile App Features
- **Native Android App**: Full APK generation
- **Splash Screen**: Custom BJP-themed splash screen
- **Status Bar**: Themed status bar with BJP colors
- **Camera Integration**: Photo/video capture capabilities
- **File System Access**: Local file management
- **Share Intent**: Native Android sharing

## Customization

### Colors
The app uses a custom BJP color scheme defined in `tailwind.config.js`:
- **Saffron**: #FF9933 (Primary)
- **Green**: #138808 (Secondary)
- **Blue**: #000080 (Accent)

### Branding
- Logo: Located in `src/assets/bjp-logo.svg`
- App Name: "BJP Himachal Pradesh"
- Package ID: `com.bjphimachal.app`

## Deployment

### Web Deployment
The app can be deployed to any static hosting service:
- Netlify (recommended)
- Vercel
- GitHub Pages
- Firebase Hosting

### Mobile App Distribution
- **Google Play Store**: Upload the generated APK
- **Direct Distribution**: Share APK file directly
- **Internal Testing**: Use Google Play Console for testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.