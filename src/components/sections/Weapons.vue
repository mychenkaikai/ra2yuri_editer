<template>
  <div class="weapons-container">
    <h2>武器设置</h2>
    
    <el-select 
      v-model="currentWeapon" 
      placeholder="选择武器" 
      class="weapon-select"
      filterable
      :loading="store.state.isLoading"
      :disabled="store.state.isLoading || !store.state.configData"
    >
      <el-option
        v-for="weapon in weaponsList"
        :key="weapon"
        :label="getWeaponDisplayName(weapon)"
        :value="weapon"
      />
    </el-select>

    <div v-if="store.state.isLoading" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="!store.state.configData" class="no-data">
      <el-alert
        title="请先打开配置文件"
        type="warning"
        show-icon
      />
    </div>

    <el-form v-if="weaponData" label-width="200px" class="weapon-form">
      <el-form-item 
        v-for="(value, key) in weaponData" 
        :key="key"
        :label="getDisplayLabel(key)"
      >
        <!-- 弹道选择 -->
        <div class="weapon-select-group" v-if="isProjectileField(key)">
          <el-select 
            v-model="weaponData[key]"
            :placeholder="'选择' + getDisplayLabel(key)"
            @change="(val) => updateValue(key, val)"
            class="select-with-button"
            filterable
          >
            <el-option
              v-for="projectile in projectilesList"
              :key="projectile"
              :label="getProjectileDisplayName(projectile)"
              :value="projectile"
            />
          </el-select>
          <el-button 
            v-if="weaponData[key]"
            type="primary" 
            link
            @click="navigateToProjectile(weaponData[key])"
          >
            <el-icon><Edit /></el-icon>
            编辑弹道
          </el-button>
        </div>
        
        <!-- 弹头选择 -->
        <div class="weapon-select-group" v-else-if="isWarheadField(key)">
          <el-select 
            v-model="weaponData[key]"
            :placeholder="'选择' + getDisplayLabel(key)"
            @change="(val) => updateValue(key, val)"
            class="select-with-button"
            filterable
          >
            <el-option
              v-for="warhead in warheadsList"
              :key="warhead"
              :label="getWarheadDisplayName(warhead)"
              :value="warhead"
            />
          </el-select>
          <el-button 
            v-if="weaponData[key]"
            type="primary" 
            link
            @click="navigateToWarhead(weaponData[key])"
          >
            <el-icon><Edit /></el-icon>
            编辑弹头
          </el-button>
        </div>
        
        <!-- 数值输入 -->
        <el-input-number 
          v-else-if="isNumericField(key)"
          v-model="numericValues[key]"
          :min="0"
          :max="99999"
          :step="1"
          :precision="getPrecision(key)"
          @change="(val) => updateValue(key, String(val))"
        />
        
        <!-- 文本输入 -->
        <el-input 
          v-else
          v-model="weaponData[key]"
          @change="(val) => updateValue(key, val)"
        />
        
        <div class="comment" v-if="comments[key]">
          {{ comments[key] }}
        </div>
      </el-form-item>
    </el-form>
    <div v-else class="no-data">
      <el-alert
        title="请选择要编辑的武器"
        type="info"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { createLogger } from '@/utils/logger'
import { store } from '@/store'
import { weaponNames } from '@/utils/weapons'

const logger = createLogger('Weapons')
const router = useRouter()
const route = useRoute()

// 定义 weaponsList 计算属性
const weaponsList = computed(() => {
  if (!store.state.configData) return []

  const sections = Object.keys(store.state.configData)
  const weaponSections = sections.filter(section => {
    const data = store.state.configData[section]
    if (!data) return false
    
    // 检查是否包含武器相关属性
    return (
      data.Damage !== undefined || 
      data.ROF !== undefined ||
      data.Range !== undefined ||
      data.Projectile !== undefined ||
      data.Warhead !== undefined ||
      data.IsMeteor !== undefined  // 添加陨石判断
    )
  })

  return weaponSections.sort((a, b) => {
    const hasTranslationA = weaponNames[a] !== undefined
    const hasTranslationB = weaponNames[b] !== undefined
    
    if (hasTranslationA && !hasTranslationB) return -1
    if (!hasTranslationA && hasTranslationB) return 1
    
    const nameA = weaponNames[a] || a
    const nameB = weaponNames[b] || b
    return nameA.localeCompare(nameB, 'zh-CN')
  })
})

const currentWeapon = ref('')

// 获取武器显示名称
const getWeaponDisplayName = (weapon: string) => {
  if (!weapon) return ''
  const name = weaponNames[weapon]
  return name ? `${name} (${weapon})` : weapon
}

// 获取当前武器数据
const weaponData = computed(() => {
  if (!currentWeapon.value) return null
  return store.getters.getSectionData(currentWeapon.value)
})

const numericValues = ref<Record<string, number>>({})

// 监听武器数据变化
watch(weaponData, (newData) => {
  if (newData) {
    // 更新数值字段
    Object.entries(newData).forEach(([key, value]) => {
      if (isNumericField(key)) {
        numericValues.value[key] = parseFloat(value as string)
      }
    })
  } else {
    numericValues.value = {}
  }
}, { immediate: true })

// 修改路由参数监听逻辑
onMounted(() => {
  // 检查初始路由参数
  const weaponParam = route.query.weapon
  if (weaponParam && typeof weaponParam === 'string') {
    currentWeapon.value = weaponParam
    logger.info('Weapon selected from route:', weaponParam)
  }
})

// 监听路由参数变化
watch(
  () => route.query.weapon,
  (newWeapon) => {
    if (newWeapon && typeof newWeapon === 'string') {
      currentWeapon.value = newWeapon
      logger.info('Weapon changed from route:', newWeapon)
    }
  }
)

// 监听配置数据变化
watch(() => store.state.configData, (newData) => {
  if (newData) {
    const weaponParam = route.query.weapon
    if (weaponParam && typeof weaponParam === 'string') {
      currentWeapon.value = weaponParam
    }
  }
})

const numericFields = [
  'Damage',
  'ROF',
  'Range',
  'Speed',
  'Burst',
  'MinRange'
]

// 不同字段的精度设置
const precisionMap: Record<string, number> = {
  'ROF': 2,
  'Speed': 1,
  'Range': 0,
  'Damage': 0
}

const getPrecision = (key: string) => precisionMap[key] || 0

const comments: Record<string, string> = {
  'Damage': '伤害值',
  'ROF': '射速(秒)',
  'Range': '射程',
  'Speed': '弹道速度',
  'Burst': '连发数量',
  'MinRange': '最小射程',
  'Projectile': '武器使用的弹道类型，决定弹道的飞行方式和外观',
  'Warhead': '弹头类型'
}

const displayLabels: Record<string, string> = {
  'Damage': '伤害',
  'ROF': '射速',
  'Range': '射程',
  'Speed': '速度',
  'Burst': '连发',
  'MinRange': '最小射程',
  'Projectile': '弹道类型',
  'Warhead': '弹头'
}

const isNumericField = (key: string) => numericFields.includes(key)
const getDisplayLabel = (key: string) => displayLabels[key] || key

const updateValue = (key: string, value: string) => {
  if (!currentWeapon.value) {
    logger.warn('Attempted to update value but no weapon selected')
    return
  }
  
  if (!store.state.configData) {
    logger.warn('No config data available')
    return
  }

  try {
    logger.info(`Updating ${currentWeapon.value}.${key} to:`, value)
    store.commit('updateConfigValue', {
      section: currentWeapon.value,
      key,
      value
    })
  } catch (error) {
    logger.error('Failed to update value:', error)
    ElMessage.error('更新失败')
  }
}

// 判断是否是弹头字段
const isWarheadField = (key: string) => {
  return key.toLowerCase().includes('warhead')
}

// 判断是否是弹道字段
const isProjectileField = (key: string) => key === 'Projectile'


// 添加导航方法
const navigateToProjectile = (projectile: string) => {
  if (projectile) {
    router.push({
      path: '/projectiles',
      query: { projectile }
    })
  }
}

const navigateToWarhead = (warhead: string) => {
  if (warhead) {
    router.push({
      path: '/warheads',
      query: { warhead }
    })
  }
}
</script>

<style scoped>
.weapons-container {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.loading-state {
  margin-top: 20px;
}

.weapon-select {
  width: 100%;
  margin-bottom: 20px;
}

.no-data {
  margin-top: 20px;
}

.weapon-form {
  margin-top: 20px;
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

.weapon-select-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-with-button {
  flex: 1;
}

.edit-button {
  flex-shrink: 0;
  margin-left: auto;
}
</style>