<template>
  <div class="weapons-container">
    <h2>武器设置</h2>
    
    <el-select v-model="currentWeapon" placeholder="选择武器" class="weapon-select" filterable>
      <el-option
        v-for="weapon in weaponsList"
        :key="weapon"
        :label="getWeaponDisplayName(weapon)"
        :value="weapon"
      />
    </el-select>

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
            <template #default>
              <el-option
                v-for="projectile in projectilesList"
                :key="projectile"
                :label="getProjectileDisplayName(projectile)"
                :value="projectile"
              />
            </template>
            <template #prefix>
              {{ weaponData[key] ? getProjectileDisplayName(weaponData[key]) : '' }}
            </template>
          </el-select>
          <el-button 
            v-if="weaponData[key]"
            type="primary" 
            link
            @click="navigateToProjectile(weaponData[key])"
            class="edit-button"
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
            <template #default>
              <el-option
                v-for="warhead in warheadsList"
                :key="warhead"
                :label="getWarheadDisplayName(warhead)"
                :value="warhead"
              />
            </template>
            <template #prefix>
              {{ weaponData[key] ? getWarheadDisplayName(weaponData[key]) : '' }}
            </template>
          </el-select>
          <el-button 
            v-if="weaponData[key]"
            type="primary" 
            link
            @click="navigateToWarhead(weaponData[key])"
            class="edit-button"
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
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { createLogger } from '@/utils/logger'
import { warheadsList, getWarheadDisplayName } from '@/utils/warheads'
import { projectilesList, getProjectileDisplayName } from '@/utils/projectiles'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const logger = createLogger('Weapons')
const store = useStore()
const route = useRoute()
const router = useRouter()
const currentWeapon = ref('')

// 武器名称映射
const weaponNames: Record<string, string> = {
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

  // 坦克器
  '105mm': '灰熊坦克主炮',
  '120mm': '天启坦克主炮',
  '75mm': '轻型坦克主炮',
  '90mm': '坦克杀手主炮',
  '20mm': '防空步兵机炮',
  '25mm': '神盾巡洋舰防空炮',
  '30mm': '围攻直升机机炮',
  '50Cal': '海豹部队重机枪',
  '7.62mm': '动员兵机枪',
  '12.7mm': '米格战机机炮',
  'M60': '重装大兵机枪',
  'M1Carbine': '海豹部队卡宾枪',
  'M16': '重装大兵步枪',
  'AK47': '鲍里斯步枪',

  // 精英单位武器
  'SABOTE': '精英坦克杀手主炮',
  '20mmRapidE': '精英防空步兵炮',
  'MindControlE': '精英尤里控制',
  'MedusaE': '精英美杜莎',
  'DoublePistolsE': '精英海豹双枪',
  'AKME': '精英动员兵枪',
  
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

  // 载具武器
  'GAUSS': '磁暴坦克炮',
  'COMET': '彗星导弹',
  'APOC': '天启坦克炮',
  'TGUN': '光棱坦克炮',
  'V3Launcher': 'V3火箭车',
  'TTNK': '特斯拉坦克',

  // 步兵武器
  'DESO': '辐射工兵枪',
  'TESLA': '磁暴步兵枪',
  'SHOCK': '磁暴追猎者枪',
  'VIRUS': '病毒狙击手枪',
  'PSYWAVE': '尤里心灵波',
  'IvanBomb': '疯狂伊文炸弹',
  'TanyaC4': '谭雅C4',
  'BORIS': '���里斯AK',

  // 尤里特殊武器
  'CRMindControl': '尤里心灵控制',
  'CRPsychicJab': '尤里心灵穿刺',
  'CRVirusGun': '尤里病毒枪',
  'CRSuperMindBlast': '尤里超级冲击',
  'CRRadBeamWeapon': '尤里辐射光束',
  
  // 其他特

  // 补充其他武器
  'ParaDropBomb': '伞兵轰炸',
  'IvanBombE': '精英疯狂伊文炸弹',
  'TanyaC4E': '精英谭雅C4',
  'VirusE': '精英病毒狙击手',
  'SniperE': '精英狙击手',
  'DragonE': '精英天龙导弹',
  'VulcanE': '精英火神机炮',
  'GrandCannonE': '精英巨炮',
  'TeslaCoilE': '精英特斯拉线圈',
  'PrismTowerE': '精英光棱塔',
  'PatriotE': '精英爱国者导弹',
  'V3LauncherE': '精英V3火箭',
  'DemolisherE': '精英战术核弹',
  'GAUSSE': '精英磁暴坦克',
  'COMETE': '精英彗星导弹',
  'APOCE': '精英天启坦克',
  'DESOE': '精英辐射工兵',
  'TESLAE': '精英磁暴步兵',
  'SHOCKE': '精英磁暴追猎者',
  'VIRUSE': '精英病毒狙击手',
  'PSYWAVEE': '精英尤里',
  'TGUNE': '精英光棱坦克',
  'FLAKE': '精英防空步兵',
  'MISSILEE': '精英导弹车',
  'MGUNE': '精英机枪塔',
  'CANNONE': '精英坦克炮塔'
}

// 修改武器列表获取逻辑
const weaponsList = computed(() => {
  if (!store.state.configData) {
    logger.warn('No config data available')
    return []
  }

  // 获取所有节名
  const sections = Object.keys(store.state.configData)
  
  // 过滤出所有武器相关的节
  const weaponSections = sections.filter(section => {
    const data = store.state.configData[section]
    return data && (
      data.Damage !== undefined || 
      data.Warhead !== undefined
    )
  })

  logger.debug('Found weapon sections:', weaponSections)
  
  // 按是否有中文翻译排序
  return weaponSections.sort((a, b) => {
    const hasTranslationA = weaponNames[a] !== undefined
    const hasTranslationB = weaponNames[b] !== undefined
    
    if (hasTranslationA && !hasTranslationB) return -1
    if (!hasTranslationA && hasTranslationB) return 1
    
    // 如果都有或都没有翻译，按中文名称或原始名称排序
    const nameA = weaponNames[a] || a
    const nameB = weaponNames[b] || b
    return nameA.localeCompare(nameB, 'zh-CN')
  })
})

// 修改显示名称函数，显示中英文
const getWeaponDisplayName = (weapon: string) => {
  const name = weaponNames[weapon]
  
  // 果是精英武器（以E结尾）且没有专门的中文名
  if (!name && weapon.endsWith('E')) {
    const baseWeapon = weapon.slice(0, -1)
    const baseName = weaponNames[baseWeapon]
    if (baseName) {
      return `${baseName}(精英) (${weapon})`
    }
  }
  
  // 如果有中文名就显示中英文，否则只显示英文
  return name ? `${name} (${weapon})` : weapon
}

// 获取当前武器数据
const weaponData = computed(() => {
  if (!currentWeapon.value) {
    logger.debug('No weapon selected')
    return null
  }
  const data = store.getters.getSectionData(currentWeapon.value)
  logger.debug(`Current weapon ${currentWeapon.value} data:`, data)
  return data
})

const numericValues = ref<Record<string, number>>({})

// 监听武器数据变化,更新数值
watch(weaponData, (newData) => {
  logger.info('Weapon data changed:', newData)
  if (newData) {
    Object.entries(newData).forEach(([key, value]) => {
      if (isNumericField(key)) {
        numericValues.value[key] = parseFloat(value)
        logger.debug(`Updated numeric value for ${key}:`, numericValues.value[key])
      }
    })
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
  
  logger.info(`Updating ${currentWeapon.value}.${key} to:`, value)
  store.commit('updateConfigValue', {
    section: currentWeapon.value,
    key,
    value
  })
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

.weapon-select {
  width: 100%;
  margin-bottom: 20px;
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

.no-data {
  margin-top: 20px;
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