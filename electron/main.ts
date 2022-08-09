import { app, BrowserWindow, ipcMain, dialog } from 'electron';

import path from 'path';
import fs from 'fs';

import AdmZip from 'adm-zip';

import JavaScriptObfuscator from 'javascript-obfuscator';

let mainWindow: BrowserWindow | null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const assetsPath =
  process.env.NODE_ENV === 'production'
  ? process.resourcesPath
  : app.getAppPath();

function createWindow () {
  mainWindow = new BrowserWindow({
    icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 512,
    height: 256,
    resizable: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    backgroundColor: '#131622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    }
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function registerListeners () {
  ipcMain.on('selectZip', async (_) => {
    const files = dialog.showOpenDialogSync(mainWindow as BrowserWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Zip', extensions: ['zip'] }]
    });

    if (files) {
      const dirPath = path.join(assetsPath, 'tmp');

      const file = files[0];
      const fileName = 'project.zip';
      const filePath = path.join(dirPath, fileName);
      
      try {
        fs.readdirSync(dirPath)
      } catch (readError) {
        try {
          fs.mkdirSync(dirPath);
        } catch (makeError) {
          console.log(makeError);
        }
      }

      fs.copyFileSync(file, filePath);

      extractZip(filePath);
    }
  });
}

function extractZip(filePath: string) {
  const dirPath = path.join(assetsPath, 'tmp', 'project');

  const zip = new AdmZip(filePath);
  zip.extractAllTo(dirPath, true);

  checkZip(dirPath);
}

function checkZip(dirPath: string) {
  const files = fs.readdirSync(dirPath);

  let okay = false;

  files.forEach(file => {
    if (file !== 'index.htm' && file !== 'index.html') return;
    okay = true;
  });

  if (!okay) {
    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'error',
      message: 'There was an error processing the zip file.',
      buttons: ['OK']
    });
  }

  processZip(dirPath);
  copyNotFound();
  createAuth();
}

function processZip(dirPath: string) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (file !== 'index.htm' && file !== 'index.html') return;
    
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const javaScriptFirstPart = '<script type="text/javascript">';
    const javaScriptLastPart = '</script>';

    const fileContentFistPart = fileContent.split(javaScriptFirstPart)[0];
    const countEndScript = fileContent.split(javaScriptLastPart).length - 1;
    const fileContentLastPart = fileContent.split(javaScriptLastPart)[countEndScript];

    const javaScriptContent = fileContent.replace(fileContentFistPart, '').replace(fileContentLastPart, '').replace(javaScriptFirstPart, '').replace(javaScriptLastPart, '');
    const javaScriptContentInjected = injectZip(javaScriptContent);
    const JavaScriptContentObfuscated = JavaScriptObfuscator.obfuscate(javaScriptContentInjected, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      debugProtection: true,
      numbersToExpressions: true,
      renameGlobals: true,
      renameProperties: false,
      simplify: true,
      splitStrings: true,
      stringArray: true,
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      target: 'browser',
    });
    const javaScriptTag = javaScriptFirstPart + JavaScriptContentObfuscated + javaScriptLastPart;

    const fileContentFinal = fileContentFistPart + javaScriptTag + fileContentLastPart;
    
    fs.writeFileSync(filePath, fileContentFinal);
  });
}

function injectZip(content: string) {
  const javaScriptInjectPath = path.join(assetsPath, 'assets', 'inject.js');
  const javaScriptInjectPart = "document.addEventListener('DOMContentLoaded', onLoad);";
  const javaScriptInjectContent = fs.readFileSync(javaScriptInjectPath, 'utf8');

  const javaScriptContent = content.replace(javaScriptInjectPart, javaScriptInjectContent);

  return javaScriptContent;
}

function copyNotFound() {
  const notFoundHtmlPath = path.join(assetsPath, 'assets', 'notfound.html');
  const notFoundHtmlDestinationPath = path.join(assetsPath, 'tmp', 'project', 'notfound.html');

  fs.copyFileSync(notFoundHtmlPath, notFoundHtmlDestinationPath);
}

function createAuth() {
  const authTxtPath = path.join(assetsPath, 'tmp', 'project', 'auth.txt');
  const authTxtContent = '';

  fs.writeFileSync(authTxtPath, authTxtContent);
}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
