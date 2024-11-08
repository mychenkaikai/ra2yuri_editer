import { store } from '@/store'
import { createLogger } from '@/utils/logger'
import { computed } from 'vue'
import { cleanComment } from '@/utils/common'
// 武器名称映射
export const weaponNames: Record<string, string> = {
  // 基础武器
  'DefaultDeathWeapon': '默认死亡武器',
  'MGUN': '动员兵机枪',
  'CANNON': '灰熊坦克炮',
  'Grenade': '动员兵手榴弹',
  'Pistol': '间谍手枪',
  'DogBite': '军犬撕咬',
  'Sniper': '狙击手步枪',
  'AssaultGun': '重装大兵步枪',
  'ChainGun': '海豹链炮',
  '25mm': '神盾巡洋舰防空炮',
  
  // 坦克武器
  '105mm': '灰熊坦克主炮',
  '120mm': '天启坦克主炮',
  '75mm': '轻型坦克主炮',
  '90mm': '坦克杀手主炮',
  '20mm': '防空步兵机炮',
  '30mm': '围攻直升机机炮',
  '50Cal': '海豹部队重机枪',
  '7.62mm': '动员兵机枪',
  '12.7mm': '米格战机机炮',
  'M60': '重装大兵机枪',
  'M1Carbine': '海豹部队卡宾枪',
  'M16': '重装大兵步枪',
  'AK47': '鲍里斯步枪',
  'AKME': '精英动员兵枪',
  
  // 精英单位武器
  'SABOTE': '精英坦克杀手主炮',
  '20mmRapidE': '精英防空步兵炮',
  'MindControlE': '精英尤里控制',
  'MedusaE': '精英美杜莎',
  'DoublePistolsE': '精英海豹双枪',
  
  // 超级武器
  'IonCannon': '离子炮超武',
  'NukeWeapon': '核弹超武',
  'WeatherStormWeapon': '天气控制器',
  'PsychicDominator': '心灵支配器',
  'ChronoWeapon': '超时空武器',

  // 防御建筑武器
  'TeslaCoil': '特斯拉线圈',
  'PrismTower': '光棱塔',
  'Patriot': '爱国者导弹',
  'GrandCannon': '巨炮',
  'Vulcan': '火神机炮',
  'TTNK': '特斯拉坦克',
  
  // 载具武器
  'GAUSS': '磁暴坦克炮',
  'COMET': '彗星导弹',
  'APOC': '天启坦克炮',
  'TGUN': '光棱坦克炮',
  'V3Launcher': 'V3火箭车',
  'IvanBomb': '疯狂伊文炸弹',
  
  // 步兵武器
  'DESO': '辐射工兵枪',
  'TESLA': '磁暴步兵枪',
  'SHOCK': '磁暴追猎者枪',
  'VIRUS': '病毒狙击手枪',
  'PSYWAVE': '尤里心灵波',
  'TanyaC4': '谭雅C4',
  'BORIS': '鲍里斯AK',
  
  // 尤里特殊武器
  'CRMindControl': '尤里心灵控制',
  'CRPsychicJab': '尤里心灵穿刺',
  'CRVirusGun': '尤里病毒枪',
  'CRSuperMindBlast': '尤里超级冲击',
  'CRRadBeamWeapon': '尤里辐射光束',
  
  // 精英武器
  'VirusE': '精英病毒狙击手',
  'DragonE': '精英天龙导弹',
  'IvanBombE': '精英疯狂伊文炸弹',
  'TanyaC4E': '精英谭雅C4',
  'SniperE': '精英狙击手',
  'VulcanE': '精英火神机炮',
  'GrandCannonE': '精英巨炮',
  'TeslaCoilE': '精英特斯拉线圈',
  'PrismTowerE': '精英光棱塔',
  'PatriotE': '精英爱国者导弹',
  'V3LauncherE': '精英V3火箭',
  'GAUSSE': '精英磁暴坦克',
  'COMETE': '精英彗星导弹',
  'APOCE': '精英天启坦克',
  'DESOE': '精英辐射工兵',
  'TESLAE': '精英磁暴步兵',
  'SHOCKE': '精英磁暴追猎者',
  'PSYWAVEE': '精英尤里',
  'TGUNE': '精英光棱坦克',
  'FLAKE': '精英防空步兵',
  'MISSILEE': '精英导弹车',
  'MGUNE': '精英机枪塔',
  'CANNONE': '精英坦克炮塔'
}

// 获取武器列表
export const weaponsList = computed(() => {
  if (!store.state.configData) return []

  const sections = Object.keys(store.state.configData)
  const weaponSections = sections.filter(section => {
    const data = store.state.configData[section]
    if (!data) return false
    
    return (
      data.Damage !== undefined || 
      data.ROF !== undefined ||
      data.Range !== undefined ||
      data.Projectile !== undefined ||
      data.Warhead !== undefined
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

// 获取武器显示名称
export const getWeaponDisplayName = (weapon: string) => {
  if (!weapon) return ''
  const name = weaponNames[weapon]
  return name ? `${name} (${weapon})` : weapon
}