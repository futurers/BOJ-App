const {app, ipcMain, dialog, Notification, Tray, session, Menu, webContents} = require('electron')
const path = require('path')
const {BrowserWindow} = require('electron')
const { ElectronChromeExtensions } = require('electron-chrome-extensions')



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
      preload: path.join(__dirname, 'js/preload.js'),
    }
  })
  const extensions = new ElectronChromeExtensions()
  extensions.addTab(win.webContents, win)
  win.setMenu(null);
  win.webContents.session.loadExtension(`${__dirname}/BOJ-Extended`)
  win.webContents.openDevTools()
  win.loadURL('https://www.acmicpc.net/')
  
}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  createWindow()
})

