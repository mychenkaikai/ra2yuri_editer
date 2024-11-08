import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'

let mainWindow: BrowserWindow | null = null

// 设置 IPC 处理程序
function setupIpcHandlers() {
  ipcMain.handle('open-file-dialog', async () => {
    if (!mainWindow) throw new Error('Main window not available')
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'INI Files', extensions: ['ini'] }]
    })
    return filePaths[0]
  })

  ipcMain.handle('read-file', async (_, filePath: string) => {
    return await fs.readFile(filePath, 'utf8')
  })

  ipcMain.handle('save-file-dialog', async () => {
    if (!mainWindow) throw new Error('Main window not available')
    
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'INI Files', extensions: ['ini'] }]
    })
    
    console.log('Save dialog result:', result)
    return result.filePath
  })

  ipcMain.handle('write-file', async (_, { filePath, content }) => {
    console.log('Writing file:', filePath)
    try {
      await fs.writeFile(filePath, content, 'utf8')
      console.log('File written successfully')
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  })

  ipcMain.handle('new-file', async () => {
    if (!mainWindow) throw new Error('Main window not available')
    
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'INI Files', extensions: ['ini'] }]
    })

    if (canceled || !filePath) {
      return { success: false, message: '取消新建' }
    }

    const templatePath = process.env.NODE_ENV === 'development'
      ? path.join(__dirname, '../../templates/Rulesmd.ini')
      : path.join(__dirname, '../templates/Rulesmd.ini')
    
    await fs.copyFile(templatePath, filePath)
    const content = await fs.readFile(filePath, 'utf8')
    
    return {
      success: true,
      content,
      filePath
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  setupIpcHandlers()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

