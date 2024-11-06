import { store } from '@/store'
import { createLogger } from '@/utils/logger'
import { computed } from 'vue'
const logger = createLogger('Warheads')

// 清理注释的辅助函数
const cleanComment = (str: string) => {
  // 移除分号及其后面的所有内容
  return str.split(';')[0].trim()
}

// 获取弹头列表
export const warheadsList = computed(() => {
  const warheadsSection = store.getters.getSectionData('Warheads')
  if (!warheadsSection) {
    logger.warn('No Warheads section found')
    return []
  }

  return Object.values(warheadsSection)
    .map(value => cleanComment(value as string))
    .filter(value => value) // 过滤掉空值
    .sort()
})

// 弹头显示名称映射
export const warheadNames: Record<string, string> = {
  'SAMWH': '防空导弹弹头',
  'HollowPoint': '空尖弹',
  'HE': '高爆弹',
  'AP': '穿甲弹',
  'SA': '反装甲',
  'GRIZAPE': '灰熊坦克弹头',
  'APOC': '天启坦克弹头',
  'Controller': '心灵控制弹头',
  'IvanWH': '伊文炸弹弹头',
  'FlakWH': '防空炮弹头',
  'FlakTWH': '防空塔弹头',
  'DiskWH': '镭射圆盘弹头',
  'HowitzerWH': '榴弹炮弹头'
}

// 获取弹头显示名称
export const getWarheadDisplayName = (warhead: string) => {
  const cleanWarhead = cleanComment(warhead)
  const name = warheadNames[cleanWarhead]
  return name ? `${name} (${cleanWarhead})` : cleanWarhead
} 