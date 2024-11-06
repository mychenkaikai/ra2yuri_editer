import { createStore } from 'vuex'
import { parseIni, stringifyIni } from '../utils/parser'
import { fileUtils, useFileSelect } from '../utils/file'
import { ElMessage } from 'element-plus'  // 添加这行
interface State {
    configData: any;
    currentSection: string;
    isModified: boolean;
    isLoading: boolean;
    error: string | null;
  }
export const store = createStore<State>({
    state: {
        configData: null,
        currentSection: '',
        isModified: false,
        isLoading: false,
        error: null
    },
    mutations: {
        setConfigData(state, data) {
            console.log('[Store] Setting config data:', Object.keys(data))
            state.configData = data
        },
        setCurrentSection(state, section) {
            state.currentSection = section;
        },
        setIsModified(state, status) {
            state.isModified = status;
        },
        updateConfigValue(state, { section, key, value }) {
            console.log(`[Store] Updating ${section}.${key} to:`, value)
            if (state.configData && state.configData[section]) {
                state.configData[section][key] = value;
                state.isModified = true;
            } else {
                console.error(`[Store] Failed to update ${section}.${key} - section not found`)
            }
        },
        setLoading(state, status: boolean) {
            state.isLoading = status
          },
          setError(state, error: string | null) {
            state.error = error
        }
    },
    getters: {
        currentSectionData: (state) => {
            return state.configData && state.currentSection
                ? state.configData[state.currentSection]
                : null;
        },
        getSectionData: (state) => (section: string) => {
            console.log(`[Store] Getting data for section: ${section}`)
            if (!state.configData) {
                console.warn('[Store] No config data loaded')
                return null
            }
            console.log('[Store] Available sections:', Object.keys(state.configData))
            const data = state.configData[section]
            console.log(`[Store] Section ${section} data:`, data)
            return data
        }
    },
    actions: {
        async loadConfig({ commit }) {
            console.log('[Store] Loading config file...')
            try {
              const content = await fileUtils.readFile()
              const config = parseIni(content)
              console.log('[Store] Loaded sections:', Object.keys(config))
              console.log('[Store] WeaponTypes section:', config.WeaponTypes)
              commit('setConfigData', config)
              commit('setCurrentSection', 'General')
              ElMessage.success('配置文件加载成功')
              console.log('[Store] Config loaded successfully')
            } catch (error) {
              console.error('[Store] Failed to load config:', error)
              const message = error instanceof Error ? error.message : '未知错误'
              commit('setError', message)
              ElMessage.error(`加载配置文件失败: ${message}`)
            }
          },
        async saveConfig({ state, commit }) {
          if (!state.configData) return
            commit('setIsModified', false)
          commit('setLoading', true)
          commit('setError', null)
          try {
            const content = stringifyIni(state.configData)
            await fileUtils.saveFile(content)
            commit('setIsModified', false)
            ElMessage.success('保存成功')
          } catch (error) {
            const message = error instanceof Error ? error.message : '未知错误'
            commit('setError', message)
            ElMessage.error(`保存失败: ${message}`)
          } finally {
            commit('setLoading', false)
          }
        }
      }
})