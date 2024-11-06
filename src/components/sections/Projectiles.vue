<template>
  <div class="projectiles-container">
    <h2>弹道设置</h2>
    
    <el-select 
      v-model="currentProjectile" 
      placeholder="选择弹道类型" 
      class="projectile-select"
    >
      <el-option
        v-for="projectile in projectilesList"
        :key="projectile"
        :label="getProjectileDisplayName(projectile)"
        :value="projectile"
      />
    </el-select>

    <el-form v-if="projectileData" label-width="200px" class="projectile-form">
      <el-form-item 
        v-for="(value, key) in projectileData" 
        :key="key"
        :label="getDisplayLabel(key)"
      >
        <el-switch 
          v-if="isBooleanField(key)"
          v-model="projectileData[key]"
          active-value="yes"
          inactive-value="no"
          @change="(val) => updateValue(key, val)"
        />
        <el-input-number 
          v-else-if="isNumericField(key)"
          v-model="numericValues[key]"
          :min="0"
          :max="99999"
          :step="1"
          @change="(val) => updateValue(key, String(val))"
        />
        <el-input 
          v-else
          v-model="projectileData[key]"
          @change="(val) => updateValue(key, val)"
        />
        <div class="comment" v-if="comments[key]">
          {{ comments[key] }}
        </div>
      </el-form-item>
    </el-form>
    <div v-else class="no-data">
      <el-alert
        title="请选择要编辑的弹道类型"
        type="info"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { createLogger } from '@/utils/logger'
import { projectilesList, getProjectileDisplayName } from '@/utils/projectiles'

const logger = createLogger('Projectiles')
const store = useStore()
const currentProjectile = ref('')

// 布尔型字段
const booleanFields = [
  'AA',
  'AG',
  'AN',
  'AS',
  'ASW',
  'Airburst',
  'Arcing',
  'Bouncy'
]

// 数值型字段
const numericFields = [
  'Acceleration',
  'Arm',
  'Speed',
  'ROT',
  'Elasticity',
  'Proximity'
]

// 显示标签
const displayLabels: Record<string, string> = {
  'AA': '可对空',
  'AG': '可对地',
  'AN': '可对海',
  'AS': '可对潜艇',
  'ASW': '反潜作战',
  'Acceleration': '加速度',
  'Airburst': '空中爆炸',
  'Arcing': '抛物线轨迹',
  'Arm': '武器准备时间',
  'Bouncy': '弹跳',
  'Speed': '速度',
  'ROT': '转向速度',
  'Elasticity': '弹性',
  'Proximity': '接近引信',
  'Image': '弹道图像'
}

// 注释说明
const comments: Record<string, string> = {
  'AA': '是否可以攻击空中目标',
  'AG': '是否可以攻击地面目标',
  'AN': '是否可以攻击海上目标',
  'AS': '是否可以攻击潜艇',
  'ASW': '是否为反潜武器',
  'Acceleration': '弹道加速度',
  'Airburst': '是否在目标上方爆炸',
  'Arcing': '是否使用抛物线轨迹',
  'Arm': '武器发射后的准备时间',
  'Bouncy': '是否在撞击后弹跳',
  'Speed': '弹道飞行速度',
  'ROT': '弹道转向速度',
  'Elasticity': '弹跳弹性系数',
  'Proximity': '接近引信触发距离',
  'Image': '弹道使用的图像'
}

const isBooleanField = (key: string) => booleanFields.includes(key)
const isNumericField = (key: string) => numericFields.includes(key)
const getDisplayLabel = (key: string) => displayLabels[key] || key

// 获取当前弹道数据
const projectileData = computed(() => {
  if (!currentProjectile.value) return null
  const data = store.getters.getSectionData(currentProjectile.value)
  logger.debug('Projectile data:', data)
  return data
})

// 数值型字段的本地状态
const numericValues = ref<Record<string, number>>({})

// 监听数据变化
watch(projectileData, (newData) => {
  if (newData) {
    Object.entries(newData).forEach(([key, value]) => {
      if (isNumericField(key)) {
        numericValues.value[key] = parseFloat(value)
      }
    })
  }
}, { immediate: true })

// 更新值
const updateValue = (key: string, value: string) => {
  if (!currentProjectile.value) return
  store.commit('updateConfigValue', {
    section: currentProjectile.value,
    key,
    value
  })
}
</script>

<style scoped>
.projectiles-container {
  padding: 20px;
}

.projectile-select {
  width: 100%;
  margin-bottom: 20px;
}

.comment {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-input-number) {
  width: 180px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}
</style>