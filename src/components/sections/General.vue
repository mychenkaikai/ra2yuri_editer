<template>
  <div class="general-container">
    <h2>基础设置</h2>
    <el-form v-if="sectionData" label-width="200px">
      <el-form-item 
        v-for="(value, key) in sectionData" 
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
          v-model="sectionData[key]"
          @change="(val) => updateValue(key, val)"
        />
        <div class="comment" v-if="comments[key]">
          {{ comments[key] }}
        </div>
      </el-form-item>
    </el-form>
    <div v-else class="no-data">
      <el-alert
        title="未找到基础设置数据"
        type="warning"
        description="请先打开配置文件"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { createLogger } from '@/utils/logger'

const logger = createLogger('General')
const store = useStore()
const numericValues = ref<Record<string, number>>({})

// 定义数值类型字段
const numericFields = [
  'VeteranRatio',
  'VeteranCombat',
  'VeteranSpeed'
]

// 定义显示标签
const displayLabels: Record<string, string> = {
  'VeteranRatio': '升级所需经验',
  'VeteranCombat': '精英伤害倍数',
  'VeteranSpeed': '精英速度倍数'
}

// 定义注释说明
const comments: Record<string, string> = {
  'VeteranRatio': '必须摧毁相同价值的单位才能升级',
  'VeteranCombat': '精英单位的伤害倍数',
  'VeteranSpeed': '精英单位的速度倍数'
}

const isNumericField = (key: string) => numericFields.includes(key)
const getDisplayLabel = (key: string) => displayLabels[key] || key

const sectionData = computed(() => {
  const data = store.getters.getSectionData('General')
  logger.debug('General section data:', data)
  return data
})

// 监听数据变化
watch(sectionData, (newData) => {
  logger.info('General data changed:', newData)
  if (newData) {
    Object.entries(newData).forEach(([key, value]) => {
      if (isNumericField(key)) {
        numericValues.value[key] = parseFloat(value)
        logger.debug(`Updated numeric value for ${key}:`, numericValues.value[key])
      }
    })
  }
}, { immediate: true })

const updateValue = (key: string, value: string) => {
  logger.info(`Updating General.${key} to:`, value)
  store.commit('updateConfigValue', {
    section: 'General',
    key,
    value
  })
}
</script>

<style scoped>
.general-container {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.comment {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.no-data {
  padding: 20px;
}

:deep(.el-input-number) {
  width: 180px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}
</style>