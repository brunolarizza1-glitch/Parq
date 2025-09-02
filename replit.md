# Overview

Parq is a full-stack parking space marketplace application that connects parking space owners with users seeking parking. The platform enables property owners to list their parking spaces and allows users to search, book, and pay for parking spots in real-time. Built with a modern tech stack, it features a React-based frontend with TypeScript, an Express.js backend API, and PostgreSQL database with Drizzle ORM for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built with React and TypeScript, utilizing modern development patterns:

- **Component Library**: Radix UI components with shadcn/ui for consistent, accessible UI elements
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-based architecture with reusable UI components, page-level components, and custom hooks for shared functionality.

## Backend Architecture

The server-side API is built with Express.js and follows RESTful principles:

- **Framework**: Express.js with TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod schemas shared between frontend and backend
- **Storage Pattern**: Interface-based storage layer with in-memory implementation for development
- **API Design**: RESTful endpoints for CRUD operations on users, parking spaces, bookings, and reviews

The backend uses a layered architecture separating route handlers, business logic, and data access.

## Data Storage

The application uses PostgreSQL as the primary database with the following design decisions:

- **ORM**: Drizzle ORM chosen for its TypeScript-first approach and performance
- **Schema Management**: Database migrations handled through Drizzle Kit
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Development Storage**: In-memory storage implementation for local development and testing

## Database Schema

The core entities include:
- **Users**: Authentication and profile information
- **Parking Spaces**: Location, pricing, amenities, and availability data
- **Bookings**: Reservation details with status tracking
- **Reviews**: Rating and feedback system for parking spaces

## Authentication and Authorization

Currently implements a simplified authentication system with:
- User management through the users table
- Mock user sessions for development
- Session-based authentication patterns prepared for implementation

## External Dependencies

- **Neon Database**: Serverless PostgreSQL hosting for production database
- **Replit Integration**: Development environment integration with Cartographer and runtime error handling
- **Font Services**: Google Fonts integration for typography (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives for complex UI elements
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing library
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and development server
- **Drizzle ORM**: TypeScript ORM for database operations

# Recent Changes

**August 31, 2025:**
- Enhanced mobile responsiveness with hamburger menu navigation
- Added touch-optimized interactions with active states and scale animations
- Implemented distance-based sorting with location awareness
- Created responsive booking modal that adapts to mobile screens
- Added PWA service worker optimizations for app store deployment
- Improved touch targets for mobile usability (minimum 44px touch areas)
- Added mobile-specific CSS optimizations for touch scrolling and performance
- Implemented proper SVG icons for better scalability on mobile devices