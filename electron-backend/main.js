// electron-backend/main.js

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,

    // ADICIONE ESTAS DUAS PROPRIEDADES:
    autoHideMenuBar: true, // Remove a barra de menu (File, Edit, View...)
    frame: true, // Garante que a barra de título e controles nativos estejam presentes

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  // 🚀 Caminho ABSOLUTO para o index.html
  const indexPath = path.join(
    __dirname,
    "..",
    "frontend",
    "dist",
    "index.html"
  );

  console.log("🔍 Carregando arquivo:", indexPath);

  mainWindow.loadFile(indexPath);

  mainWindow.maximize();
  // Abra o DevTools (recomendo deixar ligado durante o início)
  //mainWindow.webContents.openDevTools();
}

// Evento chamado quando o Electron está pronto
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Fecha o app quando todas as janelas forem fechadas
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
