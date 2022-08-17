const {app, ipcMain, dialog, Notification, Tray, session, Menu, webContents} = require('electron')
const path = require('path')
const {BrowserWindow} = require('electron');
const { autoUpdater } = require("electron-updater");
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


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
function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}
autoUpdater.on('checking-for-update', () => {
  log.info('업데이트 확인 중...');
});
autoUpdater.on('update-available', (info) => {
  log.info('업데이트가 가능합니다.');
});
autoUpdater.on('update-not-available', (info) => {
  log.info('현재 최신버전입니다.');
});
autoUpdater.on('error', (err) => {
  log.info('에러가 발생하였습니다. 에러내용 : ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 현재 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  log.info('업데이트가 완료되었습니다.');
});



app.on('ready', () => {
  createWindow();
  
  autoUpdater.checkForUpdates();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  createWindow()
})

