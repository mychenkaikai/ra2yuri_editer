<template>
  <div class="production-container">
    <h2>生产设置</h2>
    <el-form v-if="sectionData" label-width="200px">
      <el-form-item 
        v-for="(value, key) in sectionData" 
        :key="key"
        :label="getDisplayLabel(key)"
      >
        <el-input-number 
          v-if="isPercentageField(key)"
          v-model="numericValues[key]"
          :min="0"
          :max="100"
          :step="1"
          @change="(val) => updateValue(key, val + '%')"
        />
        <el-input-number 
          v-else-if="isNumericField(key)"
          v-model="numericValues[key]"
          :min="0"
          :max="10"
          :step="0.1"
          :precision="2"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const sectionData = computed(() => {
  const data = store.getters.getSectionData('Production')
  console.log('Production section data:', data)
  return data
})

// 数值型字段的本地状态
const numericValues = ref<Record<string, number>>({})

// 字段定义
const numericFields = [
  'BuildSpeed',
  'BuildTimeMultiplier', 
  'BuildCostMultiplier',
  'OrePurifierBonus',
  'GemPurifierBonus'
]

const percentageFields = ['RefundPercent', 'RepairPercent']

// 监听 sectionData 变化，更新本地数值状态
watch(sectionData, (newData) => {
  //console.log('Production data changed:', newData)
  if (newData) {
    Object.entries(newData).forEach(([key, value]) => {
      //console.log('Processing field:', key, value)
      if (isPercentageField(key)) {
        numericValues.value[key] = parseInt(value.replace('%', ''))
      } else if (isNumericField(key)) {
        numericValues.value[key] = parseFloat(value)
      }
    })
  }
}, { immediate: true })

const comments: Record<string, string> = {
  'BuildSpeed': '建造速度倍数',
  'BuildTimeMultiplier': '建造时间倍数',
  'BuildCostMultiplier': '建造费用倍数',
  'RefundPercent': '出售退款百分比',
  'OrePurifierBonus': '矿石提纯器加成',
  'GemPurifierBonus': '宝石提纯器加成'
}

const displayLabels: Record<string, string> = {
  'BuildSpeed': '建造速度',
  'BuildTimeMultiplier': '建造时间',
  'BuildCostMultiplier': '建造费用',
  'RefundPercent': '退款比例',
  'OrePurifierBonus': '矿石提纯',
  'GemPurifierBonus': '宝石提纯'
}

const isPercentageField = (key: string) => percentageFields.includes(key)
const isNumericField = (key: string) => numericFields.includes(key)
const getDisplayLabel = (key: string) => displayLabels[key] || key

const updateValue = (key: string, value: string) => {
  store.commit('updateConfigValue', {
    section: 'Production',
    key,
    value
  })
}
</script>

<style scoped>
.production-container {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
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