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
    backgroundColor: '#191622',
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
  ipcMain.on('selectZip', async (_, requestUrl) => {
      if(requestUrl === '') {
        dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
          type: 'error',
          message: 'Please enter a valid request url.',
          buttons: ['OK'],
        });

        return;
      }

      dialog.showMessageBox(mainWindow as BrowserWindow, {
      type: 'info',
      message: 'Select a zip file to process.',
      buttons: ['OK'],
    }).then(() => selectZip(requestUrl));
  });

  ipcMain.on('generateJson', async (_) => {
    dialog.showMessageBox(mainWindow as BrowserWindow, {
      type: 'info',
      message: 'Select a path to save the generated json file.',
      buttons: ['OK'],
    }).then(() => generateJson());
  });
}

function generateJson() {
  const jsonPath = path.join(assetsPath, 'assets', 'auth.json');

  const file = dialog.showSaveDialogSync(mainWindow as BrowserWindow, {
    nameFieldLabel: 'auth',
    filters: [{ name: 'Json', extensions: ['json'] }],
  });

  if (!file) {
    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'info',
      message: 'No json location to save selected.',
      buttons: ['OK'],
    });

    return;
  }

  try {
    fs.copyFileSync(jsonPath, file as string);

    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'info',
      message: 'The json file has been saved.',
      buttons: ['OK'],
    });
  } catch (error) {
    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'error',
      message: 'There was an error saving the json file.',
      buttons: ['OK'],
    });
  }
}

function selectZip(requestUrl: string) {
  const files = dialog.showOpenDialogSync(mainWindow as BrowserWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Zip', extensions: ['zip'] }]
  });

  if (!files) {
    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'info',
      message: 'No zip file selected.',
      buttons: ['OK'],
    });

    return;
  }

  const dirPath = path.join(assetsPath, 'tmp');

  const file = files[0];
  const fileName = 'project.zip';
  const filePath = path.join(dirPath, fileName);
  
  try {
    fs.readdirSync(dirPath)
  } catch (readError) {
    console.log(readError);

    try {
      fs.mkdirSync(dirPath);
    } catch (makeError) {
      console.log(makeError);
    }
  }

  fs.copyFileSync(file, filePath);

  extractZip(filePath, requestUrl);
}

function extractZip(filePath: string, requestUrl: string) {
  const dirPath = path.join(assetsPath, 'tmp', 'project');

  const zip = new AdmZip(filePath);
  zip.extractAllTo(dirPath, true);

  fs.unlinkSync(filePath);

  checkZip(dirPath, requestUrl);
}

function checkZip(dirPath: string, requestUrl: string) {
  const files = fs.readdirSync(dirPath);

  let okay = false;

  files.forEach(file => {
    if (file !== 'index.htm' && file !== 'index.html') return;

    if (file === 'index.htm') {
      const filePath = path.join(dirPath, file);
      const newFilePath = path.join(dirPath, 'index.html');

      fs.renameSync(filePath, newFilePath);
    }

    okay = true;
  });

  if (!okay) {
    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'error',
      message: 'There was an error processing the zip file.',
      buttons: ['OK'],
    });

    return;
  }

  processZip(dirPath, requestUrl);

  dialog.showMessageBox(mainWindow as BrowserWindow, {
    type: 'info',
    message: 'The zip file has been processed, now select a path to save.',
    buttons: ['OK'],
  }).then(() => saveZip());
}

function processZip(dirPath: string, requestUrl: string) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (file !== 'index.html') return;
    
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const javaScriptFirstPart = '<script type="text/javascript">';
    const javaScriptLastPart = '</script>';

    const fileContentFistPart = fileContent.split(javaScriptFirstPart)[0];
    const countEndScript = fileContent.split(javaScriptLastPart).length - 1;
    const fileContentLastPart = fileContent.split(javaScriptLastPart)[countEndScript];

    const javaScriptContent = fileContent.replace(fileContentFistPart, '').replace(fileContentLastPart, '').replace(javaScriptFirstPart, '').replace(javaScriptLastPart, '');
    const javaScriptContentInjected = injectZip(javaScriptContent, requestUrl);
    const JavaScriptContentObfuscated = JavaScriptObfuscator.obfuscate(javaScriptContentInjected, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      debugProtection: true,
      debugProtectionInterval: 2000,
      disableConsoleOutput: true,
      log: false,
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

function injectZip(content: string, requestUrl: string) {
  const javaScriptInjectPath = path.join(assetsPath, 'assets', 'inject.js');
  const javaScriptInjectPart = "document.addEventListener('DOMContentLoaded', onLoad);";
  const javaScriptInjectContent = fs.readFileSync(javaScriptInjectPath, 'utf8');

  const javaScriptInjectContentFinal = javaScriptInjectContent.replace('REQUEST_URL', requestUrl);

  const javaScriptContent = content.replace(javaScriptInjectPart, javaScriptInjectContentFinal);

  return javaScriptContent;
}

function saveZip() {
  const dirPath = path.join(assetsPath, 'tmp', 'project');
  const filePath = path.join(dirPath, 'output.zip');
  
  const zip = new AdmZip();
  zip.addLocalFolder(dirPath);
  zip.writeZip(filePath);

  const file = dialog.showSaveDialogSync(mainWindow as BrowserWindow, {
    nameFieldLabel: 'project',
    filters: [{ name: 'Zip', extensions: ['zip'] }],
  });

  if (!file) {
    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'info',
      message: 'No zip location to save selected.',
      buttons: ['OK'],
    });

    return;
  }

  try {
    fs.copyFileSync(filePath, file as string);

    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'info',
      message: 'The zip file has been saved.',
      buttons: ['OK'],
    });
    
    fs.unlinkSync(filePath);
    
    if  (process.env.NODE_ENV === 'production')
      fs.rmdirSync(path.join(assetsPath, 'tmp'), { recursive: true });
  } catch (error) {
    dialog.showMessageBoxSync(mainWindow as BrowserWindow, {
      type: 'error',
      message: 'There was an error saving the zip file.',
      buttons: ['OK'],
    });

    console.log(error);

    return;
  }
}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(error => console.error(error))

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
