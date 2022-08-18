const {app, ipcMain, dialog, Notification, Tray, session, Menu, webContents} = require('electron')
const path = require('path')
const {BrowserWindow} = require('electron');
const { autoUpdater } = require("electron-updater");



function createWindow () {  
  let win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      nativeWindowOpen: true,
      enableRemoteModule: false,
      sandbox: false,
      preload: path.join(__dirname, 'js/preload.js')
    },
    icon: path.join(__dirname, 'icon/icon.png')
  })
  win.setMenu(null);
  try {
    session.defaultSession.loadExtension(`${__dirname}/boj-extended`);
  } catch (error) {
    session.defaultSession.loadExtension(`${__dirname}\boj-extended`);
  }
  win.loadURL('https://www.acmicpc.net/')
  // win.webContents.toggleDevTools()
}



app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  createWindow()
})

