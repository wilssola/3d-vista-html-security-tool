import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  selectZip: (requestUrl: string) => {
    ipcRenderer.send('selectZip', requestUrl);
  },

  generateJson: () => {
    ipcRenderer.send('generateJson');
  },
  
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  }
}

contextBridge.exposeInMainWorld('Main', api);
