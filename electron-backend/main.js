const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
// 1. IMPORTAÇÃO: Inclui todas as funções de CRUD necessárias
const {
  initDatabase,
  getPacientes,
  savePaciente,
  updatePaciente, // Adicionado
  removePaciente, // Adicionado
} = require("./database/sqlite_handler");

let mainWindow;

const preloadPath = path.join(__dirname, 'preload.js');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,

    autoHideMenuBar: true, // Remove a barra de menu (File, Edit, View...)
    frame: true, // Mantém a barra de título e controles nativos

    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },


  });

  // Caminho ABSOLUTO para o index.html (dentro de frontend/dist)
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
 // mainWindow.webContents.openDevTools(); // Mantenha comentado, ou descomente para debug
}

// 2. CORREÇÃO CRÍTICA: Inicializa o banco de dados antes de criar a janela
app.whenReady().then(() => {
  try {
    initDatabase(); // <-- CHAMA A FUNÇÃO DE INICIALIZAÇÃO DO SQLITE
    console.log("Banco de dados inicializado com sucesso.");
  } catch (e) {
    console.error("ERRO CRÍTICO AO INICIALIZAR O BANCO:", e);
  }
    
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 3. Mapeamento IPC Completo (CRUD)

// Leitura de Dados (SELECT)
ipcMain.handle("get-pacientes", async (event) => {
  try {
    return await getPacientes();
  } catch (error) {
    console.error("Erro IPC (get-pacientes):", error);
    throw error;
  }
});

// Salvamento de Dados (INSERT)
ipcMain.handle("save-paciente", async (event, pacienteData) => {
  try {
    return await savePaciente(pacienteData);
  } catch (error) {
    console.error("Erro IPC (save-paciente):", error);
    throw error;
  }
});

// Atualização de Dados (UPDATE) - Implementação que faltava
ipcMain.handle("update-paciente", async (event, pacienteData) => {
  try {
    return await updatePaciente(pacienteData); 
  } catch (error) {
    console.error("Erro IPC (update-paciente):", error);
    throw error;
  }
});

// Remoção de Dados (DELETE) - Implementação que faltava
ipcMain.handle("remove-paciente", async (event, id) => {
  try {
    return await removePaciente(id); 
  } catch (error) {
    console.error("Erro IPC (remove-paciente):", error);
    throw error;
  }
});


// Fecha o app quando todas as janelas forem fechadas
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});