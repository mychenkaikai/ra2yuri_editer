// 通用的清理注释函数
export const cleanComment = (str: string) => {
  if (!str) return ''
  
  // 移除方括号
  let cleaned = str.replace(/[\[\]]/g, '')
  
  // 移除分号及其后面的所有内容
  cleaned = cleaned.split(';')[0]
  
  // 移除前后空格
  cleaned = cleaned.trim()
  
  // 移除 ZZZ 和 Name: 等前缀
  cleaned = cleaned
    .replace(/^ZZZ\s+/, '')
    .replace(/^Name:\s*/, '')
    
  return cleaned
} 