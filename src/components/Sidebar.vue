<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    @select="handleSelect"
  >
    <el-menu-item index="/general">
      <el-icon><Setting /></el-icon>
      <span>基础设置</span>
    </el-menu-item>

    <el-menu-item index="/units">
      <el-icon><User /></el-icon>
      <span>单位设置</span>
    </el-menu-item>

    <el-menu-item index="/weapons">
      <el-icon><Aim /></el-icon>
      <span>武器设置</span>
    </el-menu-item>

    <el-menu-item index="/warheads">
      <el-icon><Aim /></el-icon>
      <span>弹头设置</span>
    </el-menu-item>

    <el-menu-item index="/projectiles">
      <el-icon><Aim /></el-icon>
      <span>弹道设置</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Setting, User, Aim } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const handleSelect = (key: string) => {
  router.push(key)
}
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
}

:deep(.el-icon) {
  margin-right: 8px;
}
</style>