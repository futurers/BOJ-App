const {app, ipcMain, dialog, Notification, Tray, session, Menu, webContents, BrowserWindow} = require('electron')
const path = require('path');

let win

function createWindow () {  
  win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: true,
      nativeWindowOpen: true,
      enableRemoteModule: false,
      nodeIntegrationInWorker:true,
      sandbox: false,
      preload: path.join(__dirname, 'js/preload.js')
    },
  })
  // win.setMenu(null);
  //win.loadURL('https://www.acmicpc.net/');
  win.loadFile(__dirname + '/index.html');
  // session.defaultSession.loadExtension(`${__dirname}/boj-extended/dist`);
  // session.defaultSession.removeExtension(`${__dirname}/boj-extended/dist`);
  // win.webContents.toggleDevTools()
}


ipcMain.on('be_on', (evt) => {
  session.defaultSession.loadExtension(`${__dirname}/boj-extended/dist`, { allowFileAccess: true , unlimitedStorage: true});
});

ipcMain.on('be_off', (evt) => {
  session.defaultSession.removeExtension("mfcaadoifdifdnigjmfbekjbhehibfel");
});

app.on('ready', () => {
  createWindow();
});

app.on('windows-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
      createWindow()
  }
});