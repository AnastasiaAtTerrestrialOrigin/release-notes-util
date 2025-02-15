const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  custom: () => 'Hello from preload.ts!',
  // we can also expose variables, not just functions
})