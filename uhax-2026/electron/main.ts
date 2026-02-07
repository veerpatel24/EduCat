import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─ dist
// │ ├─┬─ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │
const DIST = path.join(__dirname, '../dist')
const VITE_PUBLIC = app.isPackaged ? DIST : path.join(DIST, '../public')

process.env.DIST = DIST
process.env.VITE_PUBLIC = VITE_PUBLIC

let win: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

// Database Path
const DB_PATH = app.isPackaged 
  ? path.join(app.getPath('userData'), 'educat-db.json')
  : path.join(process.cwd(), 'local-db.json');

// Initialize Database File
async function initDB() {
  // DB initialization is now handled by Firestore in the renderer process.
  // We no longer need to create a local JSON file.
  console.log('Skipping local DB initialization (using Cloud Firestore).');
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Security: Disable nodeIntegration and enable contextIsolation
      nodeIntegration: false,
      contextIsolation: true,
      // Allow Firebase to work by adjusting CSP
      webSecurity: true, 
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Handle CSP for Firebase
app.on('web-contents-created', (_, contents) => {
  contents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://*.google.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://www.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com ws://localhost:* https://*.firebaseapp.com; img-src 'self' data: https://www.gstatic.com https://*.firebase.com https://*.googleusercontent.com https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.google.com https://*.youtube.com;"
        ]
      }
    })
  })
})

app.whenReady().then(async () => {
  await initDB();

  // IPC Handlers for Database
  ipcMain.handle('db:read', async () => {
    try {
      const data = await fs.readFile(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read DB', error);
      return { assignments: [], categories: [] };
    }
  });

  ipcMain.handle('db:write', async (_, data) => {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to write DB', error);
      return false;
    }
  });

  createWindow();
})
