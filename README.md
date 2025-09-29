# Library Management System

A comprehensive web-based library management system built with React, TypeScript, and Tailwind CSS. This system helps manage student registrations, seat assignments, fee tracking, and automated notifications.

## 🚀 Features

### Core Functionality
- **Student Management**: Complete registration system with Google Sheets integration
- **Seat Management**: Real-time seat availability for 102 seats with visual layout
- **Fee Tracking**: Payment recording with online/offline modes and automatic receipts
- **Notification System**: Automated SMS/WhatsApp notifications for welcome, fee confirmations, and reminders
- **Reports & Analytics**: Comprehensive reporting with export functionality

### Key Highlights
- **Google Sheets Integration**: Fetch student data directly from Google Sheets
- **Real-time Dashboard**: Live statistics and recent activity tracking
- **Automated Notifications**: 
  - Welcome messages on registration
  - Fee confirmation after payment
  - Reminders 3 days before fee expiry
- **Comprehensive Reports**:
  - Monthly fee reports (online vs offline payments)
  - Student activity reports
  - Seat utilization analytics
  - Revenue analytics with trends

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Data Integration**: Google Sheets API
- **Notifications**: SMS/WhatsApp gateway integration ready

## 📋 Prerequisites

Before setting up the application, ensure you have:

1. **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
2. **VS Code** - [Download here](https://code.visualstudio.com/)
3. **Git** (optional) - [Download here](https://git-scm.com/)

## 🚀 Local Setup Instructions

### Step 1: Create Project Directory
```bash
mkdir library-management-system
cd library-management-system
```

### Step 2: Initialize the Project
```bash
# Initialize npm project
npm init -y

# Install core dependencies
npm install react@^18.2.0 react-dom@^18.2.0

# Install development dependencies
npm install -D vite@^4.4.5 @vitejs/plugin-react@^4.0.3 typescript@^5.0.2 @types/react@^18.2.15 @types/react-dom@^18.2.7

# Install additional dependencies
npm install lucide-react@^0.263.0 @supabase/supabase-js@^2.39.0 googleapis axios

# Install Tailwind CSS
npm install -D tailwindcss@^3.3.0 postcss@^8.4.24 autoprefixer@^10.4.14

# Install ESLint (compatible versions)
npm install -D eslint@^8.45.0 @eslint/js@^8.57.0 typescript-eslint@^7.18.0 eslint-plugin-react-hooks@^4.6.0 eslint-plugin-react-refresh@^0.4.3 globals@^13.20.0
```

### Step 3: Create Configuration Files

Create these configuration files in your project root:

**package.json** (update scripts section):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**tsconfig.json**:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### Step 4: Create Project Structure
```
src/
├── components/
│   ├── Layout.tsx
│   ├── Dashboard.tsx
│   ├── StudentManagement.tsx
│   ├── SeatManagement.tsx
│   ├── FeeManagement.tsx
│   ├── NotificationSystem.tsx
│   └── Reports.tsx
├── hooks/
│   └── useLibraryData.ts
├── services/
│   ├── googleSheets.ts
│   └── notifications.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Step 5: Copy Source Files
Copy all the provided source files into their respective directories.

### Step 6: Install Dependencies and Run
```bash
# Install all dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Google Sheets Integration Setup

### For Production Use:

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Service Account**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Download the JSON key file

4. **Share Your Spreadsheet**:
   - Open your Google Sheet
   - Share it with the service account email
   - Give "Editor" permissions

5. **Update Configuration**:
   - Add the service account credentials to your environment
   - Update `src/services/googleSheets.ts` with actual API calls

### Current Demo Mode:
The application currently runs with simulated data. The Google Sheets integration is set up but uses mock data for demonstration purposes.

## 📱 SMS/WhatsApp Integration

### For Production Use:

1. **Choose SMS Gateway**:
   - Twilio
   - MSG91
   - TextLocal
   - Fast2SMS

2. **Update Notification Service**:
   - Add your API credentials
   - Update `src/services/notifications.ts` with actual API calls

### Current Demo Mode:
Notifications are simulated in the console. The system is ready for integration with any SMS/WhatsApp gateway.

## 🎯 Key Features Walkthrough

### Dashboard
- Real-time statistics
- Quick action buttons that navigate to relevant sections
- Recent activity feed showing all system activities

### Student Management
- Add/edit/delete students
- Search and filter functionality
- Integration with Google Sheets

### Seat Management
- Visual seat layout (102 seats)
- Real-time availability
- Easy assignment and release

### Fee Management
- Record payments (online/offline)
- Monthly reports with export
- Payment mode tracking

### Notification System
- Automated welcome messages
- Fee confirmation SMS
- Reminder system (3 days before expiry)
- Bulk messaging capability

### Reports & Analytics
- Monthly fee reports
- Student activity tracking
- Seat utilization analytics
- Revenue trends

## 🔒 Security Considerations

- All API keys should be stored in environment variables
- Implement proper authentication for production use
- Use HTTPS for all communications
- Validate all user inputs

## 🚀 Deployment

For production deployment:

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set up environment variables for API keys
4. Configure your domain and SSL certificate

## 📞 Support

For any issues or questions:
1. Check the console for error messages
2. Ensure all dependencies are installed correctly
3. Verify Node.js version compatibility
4. Check network connectivity for API calls

## 🔄 Updates and Maintenance

- Regularly update dependencies
- Monitor API usage and limits
- Backup your Google Sheets data
- Test notification delivery regularly

---

This system provides a complete solution for library management with modern web technologies and is ready for production use with proper API integrations.