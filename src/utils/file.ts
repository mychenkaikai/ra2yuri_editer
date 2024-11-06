const { ipcRenderer } = window.require('electron')

export const fileUtils = {
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
      const filePath = await ipcRenderer.invoke('save-file-dialog')
      if (!filePath) throw new Error('未选择保存位置')
      
      await ipcRenderer.invoke('write-file', { filePath, content })
    } catch (error) {
      console.error('保存文件失败:', error)
      throw error
    }
  }
}