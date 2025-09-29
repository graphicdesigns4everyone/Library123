# Library Management System

## Overview

A comprehensive web-based library management system built with React, TypeScript, and Tailwind CSS. This system helps library owners manage student registrations, seat assignments (102 seats), fee tracking, automated notifications, and generate comprehensive reports. The application features user authentication for library owners, Google Sheets integration for student data import, and WhatsApp-based notification system for automated communication with students and parents.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### September 27, 2025
- **Project Import Completed**: Successfully imported GitHub repository and configured for Replit environment
- **Environment Setup**: Installed all dependencies, configured Vite dev server for port 5000 with proper host settings
- **Development Workflow**: Configured Frontend workflow running `npm run dev` on port 5000
- **Deployment Configuration**: Set up autoscale deployment with build process and serve configuration
- **Testing Verified**: Application runs successfully, login screen loads, Google Sheets integration working

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS for utility-first responsive design
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React hooks (useState, useEffect) with local storage persistence
- **Icons**: Lucide React for consistent iconography

### Authentication System
- **User Management**: Local storage-based authentication system for library owners
- **Session Management**: JWT-like token storage with user session persistence
- **Default Admin**: Pre-configured admin account (username: admin, password: admin123)
- **Multi-tenant Support**: User-specific data isolation using storage keys

### Data Management
- **Storage Strategy**: Browser local storage for data persistence (user-specific keys)
- **Data Models**: TypeScript interfaces for Students, Seats, Transactions, and Notifications
- **State Architecture**: Custom hook (useLibraryData) centralizing all data operations
- **Seat Management**: Fixed 102-seat layout with real-time availability tracking

### Component Architecture
- **Layout Pattern**: Main layout component with tab-based navigation
- **Feature Modules**: Separate components for Dashboard, Students, Seats, Fees, Notifications, and Reports
- **Form Handling**: Controlled components with validation and error handling
- **Modal System**: Dynamic modals for forms and confirmations

### Notification System
- **WhatsApp Integration**: Browser-based WhatsApp Web redirection for messaging
- **Message Templates**: Pre-defined templates for welcome, fee confirmation, reminders, and custom messages
- **Bulk Messaging**: Sequential message sending with delays to prevent browser blocking
- **Notification Logging**: Local tracking of sent notifications with timestamps

### Reporting System
- **Report Types**: Monthly fee reports, student activity, seat utilization, and revenue analytics
- **Data Filtering**: Month/year-based filtering with real-time calculations
- **Export Functionality**: CSV export capabilities for all report types
- **Visual Statistics**: Dashboard with key metrics and trend analysis

## External Dependencies

### Google Services
- **Google Sheets API**: Integration for importing student data from spreadsheets
- **CSV Import**: Papa Parse library for processing CSV exports from Google Sheets

### Communication Services
- **WhatsApp Web**: Browser-based messaging through wa.me URLs
- **SMS Gateway**: Prepared integration points for SMS services (not implemented)

### Development Tools
- **ESLint**: Code linting with TypeScript and React rules
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **Axios**: HTTP client for API requests and data fetching

### UI Libraries
- **Lucide React**: Icon library for consistent visual elements
- **Papa Parse**: CSV parsing for Google Sheets integration

### Build Dependencies
- **Vite**: Development server and build tool
- **TypeScript**: Static type checking and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development