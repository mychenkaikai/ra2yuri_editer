const { ipcRenderer } = window.require('electron')
import { store } from '@/store'

export const fileUtils = {
  async checkHandlers(retries = 3): Promise<string[]> {
    console.log('Checking registered handlers...')
    let lastError
    
    for (let i = 0; i < retries; i++) {
      try {
        const handlers = await ipcRenderer.invoke('list-handlers')
        console.log('Available handlers:', handlers)
        return handlers
      } catch (error) {
        console.warn(`Failed to check handlers (attempt ${i + 1}/${retries}):`, error)
        lastError = error
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    throw lastError
  },

  async readFile(): Promise<string> {
    try {
      const filePath = await ipcRenderer.invoke('open-file-dialog')
      if (!filePath) throw new Error('未选择文件')
      
      const content = await ipcRenderer.invoke('read-file', filePath)
      return content
    } catch (error) {
      console.error('读取文件失败:', error)
      throw error
    }
  },

  async saveFile(content: string): Promise<void> {
    try {
      console.log('调用保存文件方法...')
      
      // 获取当前文件路径或打开保存对话框
      let filePath = store.state.currentFilePath
      console.log('当前文件路径:', filePath)
      
      if (!filePath) {
        console.log('打开保存对话框...')
        filePath = await ipcRenderer.invoke('save-file-dialog')
        console.log('选择的保存路径:', filePath)
        
        if (!filePath) {
          throw new Error('未选择保存位置')
        }
        store.commit('setCurrentFilePath', filePath)
      }
      
      // 保存文件内容
      console.log('开始写入文件...')
      await ipcRenderer.invoke('write-file', {
        filePath,
        content
      })
      
      console.log('文件保存成功')
    } catch (error) {
      console.error('保存文件失败:', error)
      throw error
    }
  },

  async newFile(): Promise<{ content: string, filePath: string }> {
    try {
      const result = await ipcRenderer.invoke('new-file')
      if (!result.success) {
        throw new Error(result.message)
      }
      return {
        content: result.content,
        filePath: result.filePath
      }
    } catch (error) {
      console.error('新建文件失败:', error)
      throw error
    }
  }
}