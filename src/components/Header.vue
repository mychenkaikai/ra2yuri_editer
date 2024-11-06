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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
const { ipcRenderer } = window.require('electron')
import { Folder, Download } from '@element-plus/icons-vue'

const store = useStore()
const isModified = computed(() => store.state.isModified)
const isLoading = computed(() => store.state.isLoading)


const handleOpen = () => {
  store.dispatch('loadConfig')
}

const handleSave = () => {
  store.dispatch('saveConfig')
}

// 监听菜单事件
onMounted(() => {
  ipcRenderer.on('menu-open-file', handleOpen)
  ipcRenderer.on('menu-save-file', handleSave)
})

onUnmounted(() => {
  ipcRenderer.removeListener('menu-open-file', handleOpen)
  ipcRenderer.removeListener('menu-save-file', handleSave)
})
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