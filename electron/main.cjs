const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../dist/favicon.ico'),
    title: "CÃ¡lculo de Ã ndices Financeiros"
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    // Carrega o arquivo index.html gerado pelo build do Vite
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Remove o menu padrÃ£o para um visual mais profissional
  // win.setMenu(null);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
