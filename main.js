const {app, ipcMain, dialog, Notification, Tray, session, Menu, webContents} = require('electron')
const path = require('path')
const {autoUpdater} = require("electron-updater")



function createWindow () {  
  let win1 = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      nativeWindowOpen: true,
      enableRemoteModule: false,
      sandbox: false,
      preload: path.join(__dirname, 'js/preload.js'),
    }
  })
 win1.webContents.session.loadExtension(`${__dirname}/ext/boj-extended`)
  
  win1.loadURL('https://www.acmicpc.net/')
  
}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

