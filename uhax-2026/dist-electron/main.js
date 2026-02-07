"use strict";
const electron = require("electron");
const path = require("node:path");
const node_url = require("node:url");
const fs = require("node:fs/promises");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const __dirname$1 = path.dirname(node_url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href));
const DIST = path.join(__dirname$1, "../dist");
const VITE_PUBLIC = electron.app.isPackaged ? DIST : path.join(DIST, "../public");
process.env.DIST = DIST;
process.env.VITE_PUBLIC = VITE_PUBLIC;
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const DB_PATH = electron.app.isPackaged ? path.join(electron.app.getPath("userData"), "educat-db.json") : path.join(process.cwd(), "local-db.json");
async function initDB() {
  console.log("Skipping local DB initialization (using Cloud Firestore).");
}
function createWindow() {
  win = new electron.BrowserWindow({
    icon: path.join(VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js"),
      // Security: Disable nodeIntegration and enable contextIsolation
      nodeIntegration: false,
      contextIsolation: true,
      // Allow Firebase to work by adjusting CSP
      webSecurity: true
    }
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(DIST, "index.html"));
  }
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.app.on("web-contents-created", (_, contents) => {
  contents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://*.google.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://www.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com ws://localhost:* https://*.firebaseapp.com https://api.openai.com; img-src 'self' data: https://www.gstatic.com https://*.firebase.com https://*.googleusercontent.com https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.google.com https://*.youtube.com;"
        ]
      }
    });
  });
});
electron.app.whenReady().then(async () => {
  await initDB();
  electron.ipcMain.handle("db:read", async () => {
    try {
      const data = await fs.readFile(DB_PATH, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to read DB", error);
      return { assignments: [], categories: [] };
    }
  });
  electron.ipcMain.handle("db:write", async (_, data) => {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error("Failed to write DB", error);
      return false;
    }
  });
  createWindow();
});
