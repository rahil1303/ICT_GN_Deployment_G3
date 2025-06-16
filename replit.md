# TransitAccess - Accessible Public Transport Application

## Overview

TransitAccess is a WCAG 2.1 AA-compliant Progressive Web Application (PWA) designed specifically for visually impaired users to navigate public transportation systems. The application features voice-controlled transit planning, boarding assistance, and multilingual accessibility support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **State Management**: React Context API for global state, React Query for server state
- **Styling**: Tailwind CSS with high-contrast themes optimized for accessibility
- **Accessibility**: Built-in screen reader support, voice commands, haptic feedback

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with typed schema validation
- **Authentication**: Simplified header-based authentication (x-user-id)
- **Development**: Hot module replacement with Vite middleware integration

### PWA Features
- **Service Worker**: Automatic registration for offline capabilities
- **Manifest**: Web app manifest for installable experience
- **Offline Storage**: IndexedDB for local data persistence
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces

## Key Components

### Accessibility Framework
- **Voice Recognition**: Web Speech API integration for voice commands and form input
- **Text-to-Speech**: Built-in TTS service for screen reader announcements
- **Haptic Feedback**: Vibration API for tactile user feedback
- **High Contrast Themes**: Yellow/black and dark mode themes optimized for low vision
- **ARIA Live Regions**: Dynamic content announcements for screen readers
- **Keyboard Navigation**: Full keyboard accessibility with skip links

### Core Features
1. **Account Management**: User registration and subscription management
2. **Ticket System**: Purchase and validation of transit tickets
3. **Journey Planning**: Accessible route planning with voice input
4. **Boarding Assistance**: Real-time assistance requests and vehicle detection
5. **Validation System**: Check-in/check-out with validation history
6. **Alert System**: Service disruption and personal notifications
7. **Support System**: Multi-channel support with voice feedback
8. **Settings**: Comprehensive accessibility and preference management

### Data Models
- **Users**: Account information with accessibility preferences
- **Passes**: Weekly/monthly transit passes with validity tracking
- **Tickets**: Single-ride and day pass tickets with validation status
- **Journeys**: Saved and planned routes with accessibility metadata
- **Validation Events**: Check-in/check-out history with location data
- **Alerts**: System and personal notifications
- **Feedback**: User feedback and support requests
- **User Settings**: Personalized accessibility and application preferences

## Data Flow

### Client-Side Flow
1. User interacts via voice commands, touch, or keyboard
2. React components handle input with accessibility hooks
3. React Query manages API calls and caching
4. Context providers maintain global state
5. IndexedDB stores data for offline access
6. TTS and vibration provide feedback

### Server-Side Flow
1. Express middleware handles authentication and logging
2. Route handlers validate input with Zod schemas
3. Drizzle ORM executes database operations
4. Structured JSON responses with error handling
5. Development hot-reload via Vite integration

### Database Schema
- PostgreSQL with strongly-typed Drizzle schema
- Foreign key relationships between users, tickets, and journeys
- JSON fields for flexible route and metadata storage
- Timestamp tracking for validation and audit trails

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework

### Accessibility Dependencies
- **Web Speech API**: Native browser voice recognition
- **Speech Synthesis API**: Native browser text-to-speech
- **Vibration API**: Native browser haptic feedback
- **IndexedDB**: Native browser offline storage

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for server
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Replit Configuration
- **Environment**: Node.js 20, Web, PostgreSQL 16 modules
- **Development**: `npm run dev` with hot reload on port 5000
- **Production Build**: Vite client build + esbuild server bundle
- **Deployment**: Autoscale deployment with external port 80
- **Database**: Automatic PostgreSQL provisioning

### Build Process
1. Vite builds React client to `dist/public`
2. esbuild bundles Express server to `dist/index.js`
3. Production starts with `node dist/index.js`
4. Static files served from built client directory

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (auto-provisioned)
- **NODE_ENV**: Environment flag for development/production

## Changelog

Changelog:
- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.