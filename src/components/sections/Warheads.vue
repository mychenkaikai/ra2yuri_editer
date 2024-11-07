<template>
  <div class="warheads-container">
    <h2>弹头设置</h2>
    
    <el-select 
      v-model="currentWarhead" 
      placeholder="选择弹头" 
      class="warhead-select"
    >
      <el-option
        v-for="warhead in warheadsList"
        :key="warhead"
        :label="getWarheadDisplayName(warhead)"
        :value="warhead"
      />
    </el-select>

    <el-form v-if="warheadData" label-width="200px" class="warhead-form">
      <el-form-item 
        v-for="(value, key) in warheadData" 
        :key="key"
        :label="getDisplayLabel(key)"
      >
        <el-input-number 
          v-if="isNumericField(key)"
          v-model="numericValues[key]"
          :min="0"
          :max="99999"
          :step="1"
          @change="(val) => updateValue(key, String(val))"
        />
        <el-input 
          v-else
          v-model="warheadData[key]"
          @change="(val) => updateValue(key, val)"
        />
        <div class="comment" v-if="comments[key]">
          {{ comments[key] }}
        </div>
      </el-form-item>
    </el-form>
    <div v-else class="no-data">
      <el-alert
        title="请选择要编辑的弹头"
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
import { useRoute } from 'vue-router'

const logger = createLogger('Warheads')
const store = useStore()
const currentWarhead = ref('')

const route = useRoute()

// 监听路由参数变化
watch(
  () => route.query.warhead,
  (newWarhead) => {
    if (newWarhead && typeof newWarhead === 'string') {
      currentWarhead.value = newWarhead
      logger.info('Warhead selected from route:', newWarhead)
    }
  },
  { immediate: true }
)

// 清理注释的辅助函数
const cleanComment = (str: string) => {
  return str.split(';')[0].trim()
}

// 从 Warheads 节获取编号到名称的映射
const warheadToNumber = computed(() => {
  const warheadsSection = store.getters.getSectionData('Warheads')
  if (!warheadsSection) return {}
  
  const mapping: Record<string, string> = {}
  Object.entries(warheadsSection).forEach(([number, name]) => {
    const cleanName = cleanComment(name as string)
    mapping[cleanName] = number
  })
  return mapping
})

// 获取弹头列表
const warheadsList = computed(() => {
  const warheadsSection = store.getters.getSectionData('Warheads')
  logger.debug('Warheads section raw data:', {
    section: warheadsSection,
    type: typeof warheadsSection,
    keys: Object.keys(warheadsSection || {}),
    entries: Object.entries(warheadsSection || {})
  })
  
  // 查找 APSplash 相关的条目
  if (warheadsSection) {
    Object.entries(warheadsSection).forEach(([key, value]) => {
      if (String(value).toLowerCase().includes('apsplash')) {
        logger.debug('Found APSplash entry:', {
          key,
          value,
          type: typeof value
        })
      }
    })
  }

  if (!warheadsSection) {
    logger.warn('No Warheads section found')
    return []
  }

  const list = Object.values(warheadsSection)
    .map(value => {
      const cleaned = cleanComment(value as string)
      logger.debug('Processing warhead:', { 
        original: value, 
        cleaned,
        type: typeof value 
      })
      return cleaned
    })
    .filter(value => value)
    .sort()

  logger.debug('Final warheads list:', list)
  return list
})

// 获取弹头数据
const warheadData = computed(() => {
  if (!currentWarhead.value) return null
  
  const cleanName = cleanComment(currentWarhead.value)
  logger.debug('Looking for warhead:', cleanName)
  
  // 获取所有节名
  const sections = Object.keys(store.state.configData || {})
  
  // 查找匹配的节名（包括带注释的）
  const matchingSection = sections.find(section => {
    // 移除方括号和注释后比较
    const sectionName = section.replace(/[\[\]]/g, '').split(';')[0].trim()
    return sectionName.toLowerCase() === cleanName.toLowerCase()
  })
  
  if (matchingSection) {
    logger.debug('Found matching section:', matchingSection)
    const data = store.getters.getSectionData(matchingSection)
    logger.debug('Section data:', data)
    return data
  }
  
  // 如果没找到，尝试查找不带注释的节名
  const exactMatch = sections.find(section => 
    section.replace(/[\[\]]/g, '') === cleanName
  )
  
  if (exactMatch) {
    logger.debug('Found exact match:', exactMatch)
    return store.getters.getSectionData(exactMatch)
  }
  
  logger.warn(`No data found for warhead: ${cleanName}`)
  return null
})

const numericValues = ref<Record<string, number>>({})

const numericFields = [
  'Spread',
  'MaxSpread',
  'MinSpread',
  'CellSpread'
]

const displayLabels: Record<string, string> = {
  'Verses': '伤害系数',
  'Wall': '破坏围墙',
  'Wood': '破坏木材',
  'InfDeath': '步兵死亡动画',
  'Spread': '扩散范围',
  'MaxSpread': '最大扩散',
  'MinSpread': '最小扩散',
  'CellSpread': '格子扩散',
  'PercentAtMax': '最大伤害百分比',
  'Conventional': '常规弹头',
  'ProneDamage': '卧倒伤害'
}

const comments: Record<string, string> = {
  'Verses': '对不同类型单位的伤害倍数',
  'Wall': '是否能破坏围墙',
  'Wood': '是否能破坏木材',
  'InfDeath': '步兵死亡动画类型',
  'Spread': '弹头的基础扩散范围',
  'MaxSpread': '弹头的最大扩散范围',
  'MinSpread': '弹头的最小扩散范围',
  'CellSpread': '弹头的格子扩散范围',
  'PercentAtMax': '在最大扩散范围时的伤害百分比',
  'Conventional': '是否为常规弹头',
  'ProneDamage': '对卧倒单位的伤害百分比'
}

const isNumericField = (key: string) => numericFields.includes(key)
const getDisplayLabel = (key: string) => displayLabels[key] || key

// 更新值的方法
const updateValue = (key: string, value: string) => {
  if (!currentWarhead.value) return
  
  const cleanName = cleanComment(currentWarhead.value)
  
  // 获取所有节
  const sections = Object.keys(store.state.configData || {})
  
  // 找到匹配的节名（包括注释）
  const matchingSection = sections.find(section => {
    const sectionName = section.replace(/[\[\]]/g, '').split(';')[0].trim()
    return sectionName.toLowerCase() === cleanName.toLowerCase()
  })
  
  if (matchingSection) {
    store.commit('updateConfigValue', {
      section: matchingSection,
      key,
      value
    })
  } else {
    logger.warn(`Cannot update: no matching section found for warhead ${cleanName}`)
  }
}

// 监听数据变化
watch(warheadData, (newData) => {
  if (newData) {
    Object.entries(newData).forEach(([key, value]) => {
      if (isNumericField(key)) {
        numericValues.value[key] = parseFloat(value)
      }
    })
  }
}, { immediate: true })

// 弹头名称映射
const warheadNames: Record<string, string> = {
  'EMPuls': 'EMP脉冲',
  'SonicWarhead': '声波',
  'TankOGas': '毒气坦克',
  'SA': '反装甲',
  'HE': '高爆弹',
  'AP': '穿甲弹',
  'APSplash': '穿甲溅射',
  'APSplash2': '穿甲溅射2',
  'Gas': '毒气',
  'Fire': '燃烧',
  'HollowPoint': '空尖弹',
  'Super': '超级弹头',
  'Organic': '有机体',
  'FirestormWH': '火风暴',
  'IonCannonWH': '离子炮',
  'RailShot': '磁轨炮',
  'Mechanical': '机械',
  'VeinholeWH': '矿洞',
  'PlasmaWH': '等离子',
  'SAMWH': '防空导弹',
  'Controller': '心灵控制',
  'PsiPulse': '心',
  'Electric': '电击',
  'NUKE': '核弹',
  'RadBeamWarhead': '辐射光束',
  'UltraAP': '超级穿甲',
  'FlakWH': '防空炮',
  'ChronoBeam': '超时空光束',
  'VirusGas': '病毒毒气',
  'Virus': '病毒',
  'DominatorWH': '心灵支配'
}

// 获取弹头显示名称
const getWarheadDisplayName = (warhead: string) => {
  const cleanName = cleanComment(warhead)
  const name = warheadNames[cleanName]
  return name ? `${name} (${cleanName})` : cleanName
}
</script>

<style scoped>
.warheads-container {
  padding: 20px;
}

.warhead-select {
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