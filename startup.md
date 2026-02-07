# Startup Instructions

## Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

## Quick Start
Run the provided script from the project root (`uhax`):

```bash
chmod +x start.sh
./start.sh
```

## Manual Steps

If you prefer to run commands manually:

1. **Navigate to the application directory:**
   ```bash
   cd uhax-2026
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application (Development Mode):**
   This runs the app in development mode with hot-reload enabled.
   ```bash
   npm run dev
   ```

## Building for Production

To build the executable for your OS (macOS/Windows/Linux):

```bash
cd uhax-2026
npm run build
```

The output will be in the `uhax-2026/release` directory.
