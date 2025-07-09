const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => {
    return process.env.npm_package_version || '1.0.0';
  },
  
  getPlatform: () => {
    return process.platform;
  },
  
  // Window controls
  minimizeWindow: () => {
    ipcRenderer.invoke('minimize-window');
  },
  
  maximizeWindow: () => {
    ipcRenderer.invoke('maximize-window');
  },
  
  closeWindow: () => {
    ipcRenderer.invoke('close-window');
  },
  
  // Notifications
  showNotification: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  },
  
  // Request notification permission
  requestNotificationPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }
});

// DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
  // Add Electron-specific styling
  document.body.classList.add('electron-app');
  
  // Request notification permission on startup
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // Add custom CSS for Electron
  const style = document.createElement('style');
  style.textContent = `
    .electron-app {
      user-select: none;
    }
    
    .electron-app input,
    .electron-app textarea,
    .electron-app [contenteditable] {
      user-select: text;
    }
    
    /* Custom scrollbar for Electron */
    .electron-app ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .electron-app ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    .electron-app ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    .electron-app ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `;
  document.head.appendChild(style);
});
