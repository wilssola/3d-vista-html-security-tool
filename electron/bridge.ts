import { contextBridge, ipcRenderer } from 'electron'

export const api = {
  selectZip: () => {
    ipcRenderer.send('selectZip');
  },
  
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  }
}

contextBridge.exposeInMainWorld('Main', api)
