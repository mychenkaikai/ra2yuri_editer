<template>
  <div class="units-container">
    <h2>单位设置</h2>
    
    <el-tabs type="border-card">
      <el-tab-pane 
        v-for="(units, category) in categorizedUnits" 
        :key="category"
        :label="unitCategories[category].name"
      >
        <el-select 
          v-model="currentUnit" 
          placeholder="选择单位" 
          class="unit-select"
        >
          <el-option
            v-for="unit in units"
            :key="unit"
            :label="getUnitDisplayName(unit)"
            :value="unit"
          />
        </el-select>

        <el-form v-if="unitData" label-width="200px" class="unit-form">
          <el-form-item 
            v-for="(value, key) in unitData" 
            :key="key"
            :label="getDisplayLabel(key)"
          >
            <el-select 
              v-if="isWeaponField(key)"
              v-model="unitData[key]"
              :placeholder="'选择' + getDisplayLabel(key)"
              @change="(val) => updateValue(key, val)"
            >
              <el-option
                v-for="weapon in weaponsList"
                :key="weapon"
                :label="getWeaponDisplayName(weapon)"
                :value="weapon"
              />
            </el-select>
            
            <el-select 
              v-else-if="isWarheadField(key)"
              v-model="unitData[key]"
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
            <el-input 
              v-else
              v-model="unitData[key]"
              @change="(val) => updateValue(key, val)"
            />
            <div class="comment" v-if="comments[key]">
              {{ comments[key] }}
            </div>
          </el-form-item>
        </el-form>
        <div v-else class="no-data">
          <el-alert
            title="请选择要编辑的单位"
            type="info"
            show-icon
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { createLogger } from '@/utils/logger'
import { weaponsList, getWeaponDisplayName } from '@/utils/weapons'
import { warheadsList, getWarheadDisplayName } from '@/utils/warheads'

const logger = createLogger('Units')
const store = useStore()
const sectionData = computed(() => store.getters.getSectionData('InfantryTypes'))

const numericValues = ref<Record<string, number>>({})

const numericFields = [
  'Strength',
  'Sight',
  'Speed',
  'Cost',
  'Points',
  'TechLevel'
]

const comments: Record<string, string> = {
  'Strength': '单位的生命值',
  'Sight': '单位的视野范围',
  'Speed': '单位的移动速度',
  'Cost': '单位的建造费用',
  'Points': '单位被消灭时的得分',
  'TechLevel': '需要的科技等级',
  'Owner': '单位的所属方',
  'Primary': '单位的主要武器',
  'Secondary': '单位的次要武器',
  'Prerequisite': '建造所需的前置建筑',
  'RequiredHouse': '可以建造该单位的阵营',
  'Armor': '单位的护甲类型',
  'Image': '单位在游戏中的图像',
  'Warhead': '武器使用的弹头类型',
  'EliteWarhead': '精英状态下使用的弹头类型'
}

const displayLabels: Record<string, string> = {
  'Strength': '生命值',
  'Sight': '视野',
  'Speed': '速度',
  'Cost': '费用',
  'Points': '分数',
  'TechLevel': '等级',
  'Owner': '所属',
  'Primary': '主武器',
  'Secondary': '副武器',
  'Prerequisite': '前置条件',
  'RequiredHouse': '所需阵营',
  'Armor': '护甲类型',
  'Image': '单位图像',
  'Warhead': '弹头类型',
  'EliteWarhead': '精英弹头'
}

const currentUnit = ref('')

// 添加单位分类定义
const unitCategories = {
  'infantry': {
    name: '步兵单位',
    check: (data: any) => {
      // 扩展步兵检测条件
      return (
        data.Category?.toLowerCase().includes('infantry') ||  // 类别包含infantry
        data.Image?.toLowerCase().includes('inf') || 
        data.Prerequisite?.includes('BARR') ||
        data.Prerequisite?.includes('NAHAND') ||
        data.Size <= 2 ||  // 体型较小的通常是步兵
        data.PipScale === 'Passengers' ||  // 可以作为乘客的通常是步兵
        data.Crushable === 'yes'  // 可被碾压的通常是步兵
      )
    }
  },
  'aircraft': {
    name: '空中单位',
    check: (data: any) => {
      // 扩展空中单位检测条件
      return (
        data.Category?.toLowerCase().includes('air') ||  // 类别包含air
        data.JumpJet !== undefined ||
        data.Crashable === 'yes' ||
        data.ConsideredAircraft === 'yes' ||
        data.BalloonHover === 'yes' ||
        data.MovementZone === 'Fly' ||
        data.Locomotor?.includes('4A582746-9839-11d1-B709-00A024DDAFD1') || // 飞行动力系统
        data.Locomotor?.includes('92612C46-F71F-11d1-AC9F-006008055BB5')    // 跳跃机动力系统
      )
    }
  },
  'vehicles': {
    name: '载具单位',
    check: (data: any) => {
      // 扩展载具检测条件
      return (
        data.Category?.toLowerCase().includes('vehicle') ||
        data.Prerequisite?.includes('WEAP') || 
        data.Prerequisite?.includes('NAWEAP') ||
        (data.Crusher === 'yes' && !data.ConsideredAircraft) || // 可以碾压但不是飞行单位
        data.SpeedType === 'Track' ||  // 履带类型
        data.SpeedType === 'Wheel'     // 轮式类型
      )
    }
  },
  'buildings': {
    name: '建筑单位',
    check: (data: any) => {
      // 检查建筑特有的属性
      return (
        data.BuildCat !== undefined ||     // 建造类别
        data.Foundation !== undefined ||    // 基础大小
        data.Adjacent !== undefined ||      // 相邻要求
        data.Power !== undefined ||         // 电力需求
        data.Powered !== undefined ||       // 是否需要电力
        data.Crewed !== undefined ||        // 是否需要驻军
        data.BaseNormal !== undefined ||    // 是否基地建筑
        data.IsBaseDefense !== undefined || // 是否防御建筑
        data.Factory !== undefined ||       // 是否工厂
        data.Capturable === 'yes' ||        // 可被占领
        data.Storage !== undefined          // 存储能力
      )
    }
  }
}

// 修改单位列表获取逻辑
const categorizedUnits = computed(() => {
  if (!store.state.configData) {
    return {}
  }

  const result: Record<string, string[]> = {
    'infantry': [],
    'vehicles': [],
    'aircraft': [],
    'buildings': []
  }

  // 从对象格式中提取单位名称
  const getTypeList = (sectionName: string) => {
    const section = store.state.configData[sectionName]
    if (!section) {
      logger.warn(`No section found: ${sectionName}`)
      return []
    }
    
    // 过滤掉注释和特殊字符
    return Object.values(section)
      .filter((name: string) => {
        // 过滤掉注释
        if (name.includes(';')) {
          return false
        }
        // 过滤掉非单位项
        const invalidPrefixes = ['List', 'UIName', 'Name']
        return !invalidPrefixes.some(prefix => name.startsWith(prefix))
      })
      .map((name: string) => name.split(';')[0].trim()) // 移除可能的注释
  }

  result['infantry'] = getTypeList('InfantryTypes')
  result['vehicles'] = getTypeList('VehicleTypes')
  result['aircraft'] = getTypeList('AircraftTypes')
  result['buildings'] = getTypeList('BuildingTypes')

  logger.debug('Processed infantry types:', result['infantry'])

  return result
})

// 修改单位数据获取逻辑
const unitData = computed(() => {
  if (!currentUnit.value) {
    logger.debug('No unit selected')
    return null
  }
  
  // �� store 获取单位节点数据
  const data = store.getters.getSectionData(currentUnit.value)
  if (!data) {
    logger.warn(`No data found for unit: ${currentUnit.value}`)
    return null
  }
  
  logger.debug(`Current unit ${currentUnit.value} data:`, data)
  return data
})

// 单位名称映射
const unitNames: Record<string, string> = {
  // 步兵单位
  'ENGINEER': '工程师',
  'DOG': '警犬',
  'GHOST': '幽灵',
  'GGI': '重装大兵',
  'CLEG': '超时空军团',
  'YURI': '尤里',
  'IVAN': '疯狂伊文',
  'DESO': '辐射工兵',
  'TANY': '谭雅',
  'BORIS': '鲍里斯',
  'SPY': '间谍',
  'TERROR': '恐怖分子',
  'ARND': '海豹部队',
  'FLAKT': '防空步兵',
  'SHOK': '磁暴步兵',
  'SNIPE': '狙击手',
  'VIRUS': '病毒狙击手',
  'CHRONO': '超时空兵',
  'INITIATE': '尤里新兵',
  'SLAV': '奴隶矿工',
  'BRUTE': '尤里蛮兵',
  'HIJACKER': '载具劫持者',
  'DESOLATOR': '辐射工兵',
  'CCOMAND': '超时空突击队',
  'PTROOP': '伞兵',
  'CIVAN': '疯狂伊文克隆人',
  'YURIPR': '尤里总理',
  'PENTGEN': '五角大楼将军',
  'PRES': '总统',
  
  // 载具单位
  'MTNK': '灰熊坦克',
  'TNKD': '坦克杀手',
  'APOC': '天启坦克',
  'TTNK': '特斯拉坦克',
  'V3': 'V3火箭车',
  'DRON': '无人机',
  'HTANK': '重型坦克',
  'LTNK': '轻型坦克',
  'HTNK': '天蝎坦克',
  'SREF': '光棱坦克',
  'MGTK': '幻影坦克',
  'HORV': '武装采矿车',
  'HARV': '矿车',
  'CAOS': '混沌无人机',
  'AMCV': '盟军基地车',
  'SMCV': '苏联基地车',
  'PCV': '尤里基地车',
  'DEST': '驱逐舰',
  'SUB': '潜艇',
  'CARR': '航空母舰',
  'DRED': '无畏战舰',
  
  // 空中单位
  'HIND': '雌鹿直升机',
  'SCHP': '围攻直升机',
  'BPLN': '米格战机',
  'YF23': '黑寡妇战机',
  'ORCA': '虎鲨直升机',
  'HORNET': '大黄蜂战机',
  'ZEPH': '齐柏林飞艇',
  'KIROV': '基洛夫空艇',
  'DISK': '浮碟',
  
  // 建筑单位
  'GAPOWR': '盟军发电厂',
  'NAPOWR': '苏联发电厂',
  'GAWALL': '盟军围墙',
  'NAWALL': '苏联围墙',
  'GAPILE': '盟军兵营',
  'NAHAND': '苏联兵营',
  'GAWEAP': '盟军战车工厂',
  'NAWEAP': '苏联战车工厂',
  'GADEPT': '盟军维修厂',
  'NADEPT': '苏联维修厂',
  'GACNST': '盟军建造厂',
  'NACNST': '苏联建造厂',
  'GAAIRC': '盟军机场',
  'NAAIRC': '苏联机场',
  'GATECH': '盟军作战实验室',
  'NATECH': '苏联作战实验室',
  'GASPYSAT': '间谍卫星',
  'GAGAP': '防空缺口发生器',
  'GAWEAT': '天气控制装置',
  'NARADR': '雷达塔',
  'NAINDP': '工业工厂',
  'NANRCT': '核反应堆',
  'NAGATE': '苏联大门',
  'TESLA': '特斯拉线圈',
  'IRON': '铁幕装置',
  'PDOX': '超时空传送装置',
  'PSIS': '心灵控制装置',
  'YAGNTC': '基因突变装置',
  'YAPPET': '心灵支配装置',
  'YAGRND': '地下工厂',
  'YATECH': '尤里作战实验室',
  'YAPVLT': '尤里发电厂'
}

// 修改显示名称函数，显示中英文
const getUnitDisplayName = (unit: string) => {
  const name = unitNames[unit]
  return name ? `${name} (${unit})` : unit
}

// 监听数据变化
watch(unitData, (newData) => {
  logger.info('Unit data changed:', newData)
  if (newData) {
    Object.entries(newData).forEach(([key, value]) => {
      if (isNumericField(key)) {
        numericValues.value[key] = parseFloat(value)
        logger.debug(`Updated numeric value for ${key}:`, numericValues.value[key])
      }
    })
  }
}, { immediate: true })

// 其他代码与 Production.vue 类似,但针对单位属性进行了调整

// 添加这个函数定义
const isNumericField = (key: string) => numericFields.includes(key)

// 添加 getDisplayLabel 函数
const getDisplayLabel = (key: string) => displayLabels[key] || key

// 添加武器字段判断
const weaponFields = ['Primary', 'Secondary']
const isWeaponField = (key: string) => weaponFields.includes(key)

// 添加弹头字段判断
const warheadFields = ['Warhead', 'EliteWarhead']
const isWarheadField = (key: string) => warheadFields.includes(key)
</script>

<style scoped>
.units-container {
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

.unit-select {
  width: 100%;
  margin-bottom: 20px;
}

.unit-form {
  margin-top: 20px;
}

.no-data {
  margin-top: 20px;
}
</style>