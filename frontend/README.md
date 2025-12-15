# 🌾 AgriConnect Frontend

React TypeScript frontend for the AgriConnect agricultural marketplace platform.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Create or update `.env` file with your Gemini API key:

   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

   Get your API key from: https://makersuite.google.com/app/apikey

3. **Run development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/            # Images, icons, fonts
│   ├── components/        # Reusable React components
│   ├── data/              # Static data (data.ts)
│   ├── pages/             # Page components (18 pages)
│   ├── styles/            # Global styles (index.css)
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   └── index.tsx          # App entry point
├── .env                   # Environment variables
├── index.html             # HTML template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── vite.config.ts         # Vite config
```

## 🗂️ Path Aliases

Clean imports using TypeScript path aliases:

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

Example:

```typescript
import { Product } from "@types/types";
import ConsumerHome from "@pages/ConsumerHome";
```

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **TypeScript 5.8** - Type safety
- **Vite 6** - Build tool
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Google Gemini AI** - AI features

## 🏗️ Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## 🌐 Environment Variables

| Variable              | Description           | Required |
| --------------------- | --------------------- | -------- |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes      |

---

**Built with ❤️ for farmers and consumers**
