# BJP Himachal Pradesh Web App

A modern web application for BJP Himachal Pradesh featuring news updates, live sessions, activities, meetings, and gallery management.

## Features

- 📱 **Responsive Design**: Optimized for all devices
- 🔴 **Live Sessions**: Interactive live streaming capabilities
- 📰 **Social Media Integration**: Post management with social sharing
- 📅 **Activities & Meetings**: Event management with sharing
- 🖼️ **Gallery Management**: Photo and video management
- 🔐 **Authentication**: Secure user authentication with Supabase

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom BJP theme colors
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
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

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page components
├── lib/                # Utility libraries
└── assets/             # Static assets
```

## Database Schema

The app uses Supabase with the following main tables:

- **posts**: Social media posts with content and social links
- **activities**: Events and campaigns with dates and locations
- **meetings**: Meeting details with video links and attendees
- **gallery_items**: Photos and videos with categories and tags
- **live_sessions**: Live streaming sessions with scheduling

## Deployment

The app can be deployed to any static hosting service:
- Netlify (recommended)
- Vercel
- GitHub Pages
- Firebase Hosting

## License

This project is licensed under the MIT License.