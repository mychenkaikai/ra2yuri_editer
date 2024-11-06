import { store } from '@/store'
import { createLogger } from '@/utils/logger'
import { computed } from 'vue'
const logger = createLogger('Warheads')
// 弹道类型名称映射
export const projectileNames: Record<string, string> = {
  'InvisibleLow': '低空隐形弹道',
  'InvisibleHigh': '高空隐形弹道',
  'Invisible': '隐形弹道',
  'BULLET': '子弹',
  'CANNON': '炮弹',
  'MISSILE': '导弹',
  'AAMissile': '防空导弹',
  'AAHeatSeeker': '防空追踪导弹',
  'HeatSeeker': '热追踪导弹',
  'AirToGroundMissile': '空对地导弹',
  'FLAK': '防空炮弹',
  'LASER': '激光',
  'WAVE': '波动',
  'TORPEDO': '鱼雷',
  'BALLISTIC': '弹道轨迹',
  'FIREBALL': '火球',
  'FLAME': '火焰',
  'PLASMA': '等离子',
  'TBEAM': '特斯拉电束',
  'PBEAM': '光棱射线',
  'RAILGUN': '磁轨炮',
  'COMET': '彗星弹道',
  'LARGECOMET': '大型彗星',
  'SMALLCOMET': '小型彗星',
  'FRAGMENT': '碎片',
  'TESLAFRAG': '特斯拉碎片',
  'COMETFRAG': '彗星碎片',
  'PSYCHIC': '心灵波',
  'RADIATIONBEAM': '辐射光束',
  'NEUTRON': '中子束',
  'IONCANNON': '离子炮',
  'CHRONOBEAM': '超时空光束',
  'WEATHERBEAM': '天气控制光束'
}

// 获取弹道类型的显示名称
export const getProjectileDisplayName = (projectile: string) => {
  if (!projectile) return ''
  const name = projectileNames[projectile]
  return name ? `${name} (${projectile})` : projectile
}

// 获取所有弹道类型列表
export const projectilesList = computed(() => {
  // 从配置文件中获取所有弹道类型节
//   const store = useStore()
  const sections = Object.keys(store.state.configData || {})
  
  // 过滤出所有弹道类型相关的节
  const projectileSections = sections.filter(section => {
    const data = store.state.configData[section]
    return data && (
      data.Image !== undefined ||
      data.Airburst !== undefined ||
      data.Arcing !== undefined ||
      data.Acceleration !== undefined
    )
  })
  
  logger.debug('Found projectile sections:', projectileSections)
  return projectileSections.sort()
})