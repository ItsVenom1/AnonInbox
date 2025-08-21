# Overview

NordMail is a temporary email service that provides users with disposable email addresses for testing and verification purposes. The application integrates with the Mail.tm API to create temporary accounts and manage incoming messages. Built as a full-stack web application, it features a React frontend with a Node.js/Express backend, offering real-time email management capabilities with a clean, dark-themed user interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming, featuring a Nord-inspired dark color scheme
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Data Storage**: In-memory storage with interface abstraction for future database integration
- **API Design**: RESTful endpoints for account management and message operations
- **Development Server**: Custom Vite integration for seamless full-stack development

## Database Schema
- **Temporary Accounts**: Stores user credentials, email addresses, and Mail.tm integration tokens
- **Messages**: Stores email content including metadata, attachments, and read status
- **Schema Management**: Drizzle Kit for migrations and schema validation with Zod

## Authentication & Authorization
- **Session-based**: Uses connect-pg-simple for PostgreSQL session storage
- **Account Management**: Login/logout functionality with credential validation
- **API Integration**: Secure token management for Mail.tm API communication

## External Service Integration
- **Mail.tm API**: Primary email service provider for temporary email functionality
- **Domain Management**: Dynamic fetching of available email domains
- **Message Polling**: Automatic refresh and real-time message retrieval
- **Error Handling**: Comprehensive error management for API failures and network issues

# External Dependencies

## Core Services
- **Mail.tm API**: External temporary email service providing domain management, account creation, and message handling
- **Neon Database**: PostgreSQL database service for production data persistence

## Frontend Libraries
- **Radix UI**: Comprehensive component primitives for accessible UI elements
- **TanStack Query**: Server state management with caching and synchronization
- **Wouter**: Minimalist routing library for single-page application navigation
- **Date-fns**: Date manipulation and formatting utilities

## Backend Dependencies
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Express.js**: Web application framework for API development
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

## Development Tools
- **Vite**: Build tool with custom plugins for Replit integration
- **TypeScript**: Static type checking across the entire application
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **ESBuild**: Fast JavaScript bundler for production builds