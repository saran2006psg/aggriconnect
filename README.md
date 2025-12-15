<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌾 AgriConnect - Agricultural Marketplace Platform

A modern agricultural marketplace platform built with React, TypeScript, and Vite connecting farmers directly with consumers.

View your app in AI Studio: https://ai.studio/apps/drive/1dGVI-TzS7OEmfE5mZVh4YSGOFwObdB0z

## 📁 Project Structure

```
aggriconnect/
├── frontend/              # React TypeScript frontend application
│   ├── src/
│   │   ├── assets/       # Images, icons, fonts
│   │   ├── components/   # Reusable React components
│   │   ├── data/         # Static data (data.ts - sample products)
│   │   ├── pages/        # Page components (15 pages)
│   │   ├── styles/       # Global styles (index.css)
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Utility functions
│   │   ├── App.tsx       # Main application component
│   │   └── index.tsx     # Application entry point
│   ├── .env              # Environment variables
│   ├── index.html        # HTML template
│   ├── package.json      # Frontend dependencies
│   ├── tsconfig.json     # TypeScript configuration
│   ├── vite.config.ts    # Vite configuration
│   └── README.md         # Frontend documentation
└── README.md             # This file
```

## 🚀 Quick Start

**Prerequisites:** Node.js (v18+)

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Edit `frontend/.env` and add your Gemini API key:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 4. Run the development server
```bash
npm run dev
```

The app will be available at **http://localhost:3000**

## 🎯 Features

### For Consumers
- Browse fresh produce from local farmers
- Product catalog with ratings and reviews
- Shopping cart and checkout
- Order tracking
- Subscription services for regular deliveries
- Bulk ordering options

### For Farmers
- Product management dashboard
- Order management system
- Digital wallet and payment tracking
- Analytics and insights

### For Admins
- Platform oversight dashboard
- User and product management
- System analytics

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **TypeScript 5.8** - Type safety
- **Vite 6** - Build tool and dev server
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Google Gemini AI** - AI-powered features

## 📜 Available Scripts

Run these from the `frontend/` directory:

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## 🗂️ Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
@/*           → src/*
@components/* → src/components/*
@pages/*      → src/pages/*
@utils/*      → src/utils/*
@types/*      → src/types/*
@data/*       → src/data/*
@styles/*     → src/styles/*
@assets/*     → src/assets/*
```

Example usage:
```typescript
import { Product } from '@types/types';
import { SAMPLE_PRODUCTS } from '@data/data';
import ConsumerHome from '@pages/ConsumerHome';
```

## 🏗️ Build for Production

From the `frontend/` directory:

```bash
npm run build
```

The optimized production build will be in the `frontend/dist/` directory.

---

**Built with ❤️ for farmers and consumers**
