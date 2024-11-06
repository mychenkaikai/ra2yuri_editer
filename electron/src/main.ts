import { app, BrowserWindow, ipcMain, dialog, Menu, MenuItemConstructorOptions } from 'electron'
import * as path from 'path'  // 修改这行
import * as fs from 'fs/promises'  // 修改这行
let mainWindow: BrowserWindow | null = null

function createMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            mainWindow?.webContents.send('menu-open-file')
          }
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-file')
          }
        },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新' },
        { role: 'forceReload', label: '强制刷新' },
        { type: 'separator' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#fff'
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  createMenu()
}

// 添加文件对话框
ipcMain.handle('open-file-dialog', async () => {
  console.log('Received open-file-dialog request')
  if (!mainWindow) {
    console.log('No mainWindow found')
    return null
  }

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'INI Files', extensions: ['ini'] }
      ]
    })
    console.log('Dialog result:', result)
    
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  } catch (error) {
    console.error('Dialog error:', error)
    return null
  }
})

// 添加保存对话框
ipcMain.handle('save-file-dialog', async () => {
  if (!mainWindow) return null

  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'INI Files', extensions: ['ini'] }
    ],
    defaultPath: 'rulesmd.ini'
  })

  if (!result.canceled) {
    return result.filePath
  }
  return null
})

ipcMain.handle('read-file', async (_, filePath) => {
  try {
    console.log('Reading file:', filePath)
    const content = await fs.readFile(filePath, 'utf-8')
    console.log('File content length:', content.length)
    return content
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
})

ipcMain.handle('write-file', async (_, { filePath, content }) => {
  try {
    console.log('Writing file:', filePath)
    await fs.writeFile(filePath, content, 'utf-8')
    console.log('File written successfully')
    return true
  } catch (error) {
    console.error('Error writing file:', error)
    throw error
  }
})

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

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  dialog.showErrorBox('错误', '发生了未知错误：' + error.message)
})