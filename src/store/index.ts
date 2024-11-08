import { createStore, InjectionKey } from 'vuex'
import { parseConfig, stringifyConfig } from '@/utils/parser'
import { Config } from '@/types'
import { fileUtils } from '@/utils/file'
import { Store as VuexStore } from 'vuex'
import { cleanComment } from '@/utils/common'

interface State {
  configData: Config | null
  currentFilePath: string
  isLoading: boolean
  isModified: boolean
}

// 定义 injection key
export const key: InjectionKey<VuexStore<State>> = Symbol()

// 创建 store 实例
export const store = createStore<State>({
  state: {
    configData: null as Config | null,
    currentFilePath: '',
    isLoading: false,
    isModified: false
  },
  
  mutations: {
    setConfigData(state: State, data: Record<string, any>) {
      const cleanedData: Record<string, any> = {}
      
      for (const [section, sectionData] of Object.entries(data)) {
        // 清理节名中的注释
        const cleanSection = cleanComment(section)
        cleanedData[cleanSection] = {}
        
        // 清理节中每个值的注释
        for (const [key, value] of Object.entries(sectionData)) {
          // 跳过 __section_comment 等特殊字段
          if (key.startsWith('__')) continue
          
          const cleanKey = cleanComment(key)
          const cleanValue = typeof value === 'string' ? cleanComment(value) : value
          cleanedData[cleanSection][cleanKey] = cleanValue
        }
      }
      
      state.configData = cleanedData
    },
    setCurrentFilePath(state, path: string) {
      state.currentFilePath = path
    },
    setLoading(state, value: boolean) {
      state.isLoading = value
    },
    setModified(state, value: boolean) {
      state.isModified = value
    },
    updateConfigValue(state: State, payload: UpdatePayload) {
      if (!state.configData) return
      
      const { section, key, value } = payload
      // 跳过特殊字段
      if (key.startsWith('__')) return
      
      const cleanSection = cleanComment(section)
      const cleanKey = cleanComment(key)
      const cleanValue = typeof value === 'string' ? cleanComment(value) : value
      
      if (!state.configData[cleanSection]) {
        state.configData[cleanSection] = {}
      }
      
      state.configData[cleanSection][cleanKey] = cleanValue
    }
  },
  
  actions: {
    async loadConfigFromContent({ commit }, payload: { content: string, filePath: string }) {
      try {
        console.log('Loading config from content:', payload)
        const config = parseConfig(payload.content)
        commit('setConfigData', config)
        commit('setCurrentFilePath', payload.filePath)
        return true
      } catch (error) {
        console.error('Failed to load config from content:', error)
        throw error
      }
    },

    async loadConfig({ commit }, filePath: string) {
      try {
        const content = await fileUtils.readFile()
        const config = parseConfig(content)
        commit('setConfigData', config)
        commit('setCurrentFilePath', filePath)
        return true
      } catch (error) {
        console.error('Failed to load config:', error)
        throw error
      }
    },

    async saveConfig({ state, commit }) {
      try {
        if (!state.configData) {
          throw new Error('没有可保存的配置数据')
        }
        
        const content = stringifyConfig(state.configData)
        await fileUtils.saveFile(content)
        commit('setModified', false)
        return true
      } catch (error) {
        console.error('Failed to save config:', error)
        throw error
      }
    },

    async saveConfigFile({ state }) {
      if (!state.configData || !state.currentFilePath) {
        throw new Error('No data or file to save')
      }
      
      // 通过 IPC 调用保存方法
      return window.electron.ipcRenderer.invoke('save-config', {
        path: state.currentFilePath,
        data: state.configData
      })
    }
  },

  getters: {
    getSectionData: (state) => (section: string) => {
      if (!state.configData) return null
      return state.configData[section] || null
    },
    getCurrentFilePath: (state) => state.currentFilePath,
    isLoading: (state) => state.isLoading,
    isModified: (state) => state.isModified,
    currentConfig: (state) => {
      if (!state.configData) return null
      return stringifyConfig(state.configData)
    }
  }
})

// 导出 store 的类型
export type Store = typeof store

// 如果需要，也可以导出 State 类型
export type { State }