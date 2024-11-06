<template>
  <div class="weapons-container">
    <h2>武器设置</h2>
    
    <el-select v-model="currentWeapon" placeholder="选择武器" class="weapon-select">
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
        <el-select 
          v-if="isWarheadField(key)"
          v-model="weaponData[key]"
          :placeholder="'选择' + getDisplayLabel(key)"
          @change="(val) => updateValue(key, val)"
        >
          <el-option
            v-for="warhead in warheadsList"
            :key="warhead"
            :label="getWarheadDisplayName(warhead)"
            :value="warhead"
          />
        </el-select>
        
        <el-input-number 
          v-else-if="isNumericField(key)"
          v-model="numericValues[key]"
          :min="0"
          :max="99999"
          :step="1"
          @change="(val) => updateValue(key, String(val))"
        />
        <el-select 
          v-else-if="isProjectileField(key)"
          v-model="weaponData[key]"
          :placeholder="'选择' + getDisplayLabel(key)"
          @change="(val) => updateValue(key, val)"
        >
          <el-option
            v-for="projectile in projectilesList"
            :key="projectile"
            :label="getProjectileDisplayName(projectile)"
            :value="projectile"
          />
        </el-select>
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

const logger = createLogger('Weapons')
const store = useStore()
const currentWeapon = ref('')

// 只保留一个 weaponNames 定义
const weaponNames: Record<string, string> = {
  'DefaultDeathWeapon': '默认死亡武器',
  'SABOTE': '破甲炮',
  '20mmRapidE': '20mm速射炮',
  'MindControlE': '心灵控制',
  'MedusaE': '美杜莎导弹',
  'DoublePistolsE': '双枪',
  'AKME': 'AK步枪',
  'RedEye2': '红眼导弹',
  'Dragon': '龙炮',
  'Vulcan': '火神炮',
  'GrandCannon': '巨炮',
  'TeslaCoil': '特斯拉线圈',
  'PrismTower': '光棱塔',
  'Patriot': '爱国者导弹',
  'V3Launcher': 'V3火箭',
  'Demolisher': '战术核弹',
  'PsychicReveal': '心灵感应',
  'ChronoShot': '超时空传送',
  'IvanBomb': '伊文炸弹',
  'TanyaC4': '谭雅C4',
  'DoggieStick': '警犬撕咬',
  'ParaDropSpecial': '伞兵空投',
  'GAUSS': '高斯枪',
  'COMET': '彗星炮',
  'APOC': '天启坦克炮',
  'DESO': '辐射枪',
  'TESLA': '特斯拉电击',
  'SHOCK': '磁暴枪',
  'VIRUS': '病毒狙击枪',
  'PSYWAVE': '心灵波',
  'TGUN': '光棱射线',
  'FLAK': '防空炮',
  'MISSILE': '导弹',
  'MGUN': '机枪',
  'CANNON': '坦克炮',
  'CRMindControl': '心灵控制',
  'CRRadBeamWeapon': '辐射光束',
  'CRNeutronRifle': '中子步枪',
  'CRTerrorBomb': '恐怖分子炸弹',
  'CowShot': '牛的攻击',
  'CRPsychicJab': '心灵穿刺',
  'CRVirusGun': '病毒枪',
  'CRSuperMindBlast': '超级心灵冲击',
  'CRMissileLauncher': '导弹发射器',
  'RadBeamWeapon': '辐射光束武器',
  'RadEruptionWeapon': '辐射爆发武器',
  'RadExplosion': '辐射爆炸',
  'RadSiteWeapon': '辐射场地武器',
  'PrismWeapon': '光棱武器',
  'ElectricBolt': '电击武器',
  'TeslaBolt': '特斯拉电击',
  'PsychicDominator': '心灵支配器',
  'WeatherStormWeapon': '天气控制器',
  'IonCannon': '离子炮',
  'NukeWeapon': '核弹',
  'ChronoWeapon': '超时空武器',
  'ParaBomb': '空降炸弹',
  'DogBite': '警犬撕咬',
  'Virus': '病毒',
  'Sniper': '狙击枪',
  'AssaultGun': '突击步枪',
  'ChainGun': '链炮',
  'Pistol': '手枪',
  'Grenade': '手榴弹'
}

// 修改武器列表获取逻辑
const weaponsList = computed(() => {
  if (!store.state.configData) {
    logger.warn('No config data available')
    return []
  }

  // 获取所节名
  const sections = Object.keys(store.state.configData)
  
  // 过滤出所有武器相关的节
  const weaponSections = sections.filter(section => {
    const data = store.state.configData[section]
    // 只检查关键属性
    return data && (
      data.Damage !== undefined || 
      data.Warhead !== undefined
    )
  })

  logger.debug('Found weapon sections:', weaponSections)
  
  // 按字母顺序排序
  return weaponSections.sort()
})

// 修改显示名称函数，显示中英文
const getWeaponDisplayName = (weapon: string) => {
  const name = weaponNames[weapon]
  
  // 如果是精英武器（以E结尾）且没有专门的中文名
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
</style>