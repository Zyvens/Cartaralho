const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');
const Store = require('electron-store');

const store = new Store();
let mainWindow;
let activationWindow;

// CHAVE PÚBLICA FIXA PARA VALIDAÇÃO DO SERIAL
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqOCHBuEZ3lqawRd817Fx
esBukoSLwy/qseEmfzMwQG2eSENZdBAtBCqWeDIG2zimx5REyO4gIHeY1s6522B8
ZaztDoRLtI2UzOVYrVUYY4mreuPoZ04mQsGZRcvj9QhZDGLez09GnXhvcM9u1gS8
zEf3lE/i5u7dVi1jj7/xbxPqNQ/g9cHhdkqDLbzPCOjXmGOVWIELKhIopjnl06gI
0XFW9aoPsC47tdBGDPAP3MWYek10z595wrNYdaoVw44Cpy1XVsFDDX8spYrRBOnd
WECvC5PsdAgXh8B9TVYsm2ks7oyira5Mq7wcr64x9LLOCBgQtpN529PrGMC9ITZ+
vwIDAQAB
-----END PUBLIC KEY-----`;

// Gerar o ID único e legível da máquina (ex: primeiros 8 caracteres em maiúsculo com hífen)
const rawId = machineIdSync();
const HWID = rawId.substring(0, 8).toUpperCase() + '-' + rawId.substring(8, 16).toUpperCase();

function verifySerial(serial, hwid) {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(hwid);
    verify.end();
    return verify.verify(PUBLIC_KEY, serial, 'base64');
  } catch (err) {
    return false;
  }
}

function startMainApp() {
  // Inicia o servidor local automaticamente APÓS a ativação
  require('./server/index.js');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Cartaralho - O Jogo',
    icon: path.join(__dirname, 'public/favicon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  setTimeout(() => {
    mainWindow.loadURL('http://localhost:14273');
  }, 1000);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function showActivationWindow() {
  activationWindow = new BrowserWindow({
    width: 500,
    height: 600,
    title: 'Ativação Necessária',
    icon: path.join(__dirname, 'public/favicon.png'),
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  activationWindow.loadFile(path.join(__dirname, 'public/activation.html'));

  activationWindow.webContents.on('did-finish-load', () => {
    activationWindow.webContents.send('hwid', HWID);
  });

  activationWindow.on('closed', function () {
    activationWindow = null;
  });
}

app.whenReady().then(() => {
  const savedSerial = store.get('license_serial');

  if (savedSerial && verifySerial(savedSerial, HWID)) {
    // Licença válida!
    startMainApp();
  } else {
    // Licença inválida ou inexistente
    showActivationWindow();
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (store.get('license_serial')) startMainApp();
      else showActivationWindow();
    }
  });
});

ipcMain.on('try-activate', (event, serial) => {
  if (verifySerial(serial, HWID)) {
    // Salva permanentemente no AppData
    store.set('license_serial', serial);
    
    if (activationWindow) {
      activationWindow.close();
    }
    startMainApp();
  } else {
    // Falhou
    event.reply('activation-failed');
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
