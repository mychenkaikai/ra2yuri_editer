<template>
  <div class="app-container">
    <Header />
    <div class="main-container">
      <Sidebar />
      <div class="content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import General from './components/sections/General.vue'
import Units from './components/sections/Units.vue'
import Weapons from './components/sections/Weapons.vue'
import Warheads from './components/sections/Warheads.vue'
import Production from './components/sections/Production.vue'
import Projectiles from './components/sections/Projectiles.vue'
</script>

<style>
:root {
  --primary-color: #409EFF;
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #DCDFE6;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

/* Element Plus 样式覆盖 */
.el-button {
  border-radius: 6px;
}

.el-input__inner {
  background-color: var(--bg-color) !important;
  border-color: var(--border-color) !important;
  color: var(--text-color) !important;
}

.el-form-item__label {
  color: var(--text-color) !important;
}
</style>