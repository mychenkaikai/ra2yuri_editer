<template>
  <div class="header">
    <div class="title">
      <img src="../assets/logo.png" alt="Logo" class="logo">
      <h1>红警2尤里复仇配置编辑器</h1>
    </div>
    <div class="actions">
      <el-button 
        type="primary" 
        @click="handleOpen"
        :loading="isLoading"
        class="action-button"
      >
        <el-icon><Folder /></el-icon>
        打开配置文件
      </el-button>
      <el-button 
        type="success" 
        :disabled="!isModified || isLoading"
        :loading="isLoading"
        @click="handleSave"
        class="action-button"
      >
        <el-icon><Download /></el-icon>
        保存修改
      </el-button>
      <el-button 
        type="info" 
        :disabled="isLoading"
        @click="handleNew"
        class="action-button"
      >
        <el-icon><Plus /></el-icon>
        新建文件
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
const { ipcRenderer } = window.require('electron')
import { Folder, Download, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fileUtils } from '@/utils/file'

const store = useStore()

const isLoading = computed(() => store.state.isLoading)
const isModified = computed(() => store.state.isModified)

// 处理打开文件
const handleOpen = async () => {
  try {
    store.commit('setLoading', true)
    const content = await fileUtils.readFile()
    await store.dispatch('loadConfigFromContent', {
      content,
      filePath: store.getters.getCurrentFilePath
    })
    ElMessage.success('打开文件成功')
  } catch (error: any) {
    console.error('Open file error:', error)
    ElMessage.error(`打开失败: ${error.message}`)
  } finally {
    store.commit('setLoading', false)
  }
}

// 处理保存文件
const handleSave = async () => {
  try {
    store.commit('setLoading', true)
    console.log('开始保存文件...')
    
    // 检查配置数据
    const content = store.getters.currentConfig
    console.log('准备保存的内容:', content)
    
    if (!content) {
      throw new Error('没有可保存的配置数据')
    }
    
    await fileUtils.saveFile(content)
    store.commit('setModified', false)
    ElMessage.success('保存成功')
  } catch (error: any) {
    console.error('保存文件失败:', error)
    ElMessage.error(`保存失败: ${error.message}`)
  } finally {
    store.commit('setLoading', false)
  }
}

// 处理新建文件
const handleNew = async () => {
  console.log('handleNew called')
  try {
    store.commit('setLoading', true)
    console.log('Calling fileUtils.newFile()')
    const { content, filePath } = await fileUtils.newFile()
    console.log('newFile result:', { content, filePath })
    await store.dispatch('loadConfigFromContent', {
      content,
      filePath
    })
    ElMessage.success('新建文件成功')
  } catch (error: any) {
    console.error('New file error:', error)
    ElMessage.error(`新建失败: ${error.message}`)
  } finally {
    store.commit('setLoading', false)
  }
}
</script>

<style scoped>
.header {
  padding: 1rem 2rem;
  background: #252525;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  border-bottom: 1px solid var(--border-color);
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 32px;
  width: 32px;
}

.title h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(45deg, #ff4d4d, #ff9966);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.actions {
  display: flex;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.el-icon {
  font-size: 1.1em;
}
</style>