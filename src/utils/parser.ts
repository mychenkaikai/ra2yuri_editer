import { Config, Section } from '@/types'

// 添加一个新的类型来存储注释
type LineWithComment = {
  key: string
  value: string
  comment?: string
}

export function parseConfig(content: string): Config {
  const config: Config = {}
  let currentSection: string | null = null
  let currentSectionData: Record<string, string> = {}
  
  // 按行分割内容
  const lines = content.split(/\r?\n/)
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 完全空行，跳过
    if (!trimmedLine) {
      continue
    }
    
    // 处理节标题
    const sectionMatch = line.match(/^\[(.+?)\](.*)$/)
    if (sectionMatch) {
      // 保存之前的节
      if (currentSection) {
        config[currentSection] = currentSectionData
      }
      
      currentSection = sectionMatch[1].trim()
      const sectionComment = sectionMatch[2].trim()
      currentSectionData = {}
      
      // 只有当注释不为空时才保存节注释
      if (sectionComment && sectionComment.startsWith(';')) {
        currentSectionData['__section_comment'] = sectionComment
      }
      continue
    }
    
    // 如果有当前节，处理键值对和注释
    if (currentSection) {
      // 纯注释行，跳过
      if (trimmedLine.startsWith(';')) {
        continue
      }
      
      // 处理键值对和行内注释
      const [keyValue, ...commentParts] = line.split(';')
      if (keyValue) {
        const [key, ...valueParts] = keyValue.split('=')
        if (key && key.trim()) {
          const value = valueParts.join('=').trim()
          const comment = commentParts.join(';').trim()
          const trimmedKey = key.trim()
          
          // 保存键值对，如果有注释则包含注释
          currentSectionData[trimmedKey] = value + (comment ? ` ;${comment}` : '')
        }
      }
    }
  }
  
  // 保存最后一个节
  if (currentSection) {
    config[currentSection] = currentSectionData
  }
  
  return config
}

export function stringifyConfig(config: Config): string {
  let result = ''
  
  for (const [section, data] of Object.entries(config)) {
    // 添加节标题
    result += `[${section}]\n`
    
    // 添加节内容
    for (const [key, value] of Object.entries(data)) {
      result += `${key}=${value}\n`
    }
    
    // 添加空行分隔
    result += '\n'
  }
  
  return result
}

// 如果需要，也可以导出一些辅助函数
export function isValidSection(section: string): section is keyof Config {
  return section in defaultConfig
}

// 默认配置
const defaultConfig: Config = {
  General: {},
  // ... 其他默认配置
}

// 导出默认配置
export { defaultConfig }