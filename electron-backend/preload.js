const { contextBridge, ipcRenderer } = require('electron');

// Expõe um objeto 'ipcRenderer' globalmente para o processo de renderização (React)
contextBridge.exposeInMainWorld('ipcRenderer', {
    // Método para invocar handlers (usado para get/save/update/delete)
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),

    // Se precisar de comunicação one-way (do Main para o Render), pode adicionar:
    // on: (channel, func) => {
    //     const subscription = (event, ...args) => func(...args);
    //     ipcRenderer.on(channel, subscription);
    //     return () => ipcRenderer.removeListener(channel, subscription);
    // },
    // once: (channel, func) => {
    //     ipcRenderer.once(channel, (event, ...args) => func(...args));
    // },
});