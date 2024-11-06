interface IniSection {
    [key: string]: string;
  }
  
  interface IniData {
    [section: string]: IniSection;
  }
  
  // 清理注释的辅助函数
  function cleanComment(line: string): string {
    // 移除行尾注释
    const commentIndex = line.indexOf(';')
    if (commentIndex !== -1) {
      return line.substring(0, commentIndex).trim()
    }
    return line.trim()
  }
  
  export function parseIni(content: string): IniData {
    const result: IniData = {};
    let currentSection = '';

    console.log('Starting to parse INI content')
    const lines = content.split('\n');
    
    for (const line of lines) {
      // 先清理注释
      const cleanedLine = cleanComment(line)
      
      // 跳过空行
      if (!cleanedLine) {
        continue;
      }
      
      // 处理节名
      if (cleanedLine.startsWith('[') && cleanedLine.endsWith(']')) {
        // 移除方括号并清理可能的注释
        currentSection = cleanedLine.slice(1, -1).trim()
        result[currentSection] = {};
        continue;
      }
      
      // 处理键值对
      if (currentSection && cleanedLine.includes('=')) {
        const [key, ...values] = cleanedLine.split('=');
        const value = values.join('=').trim();
        result[currentSection][key.trim()] = value;
      }
    }
    
    console.log('Parsed INI result:', result)
    return result;
  }
  
  export function stringifyIni(data: IniData): string {
    let result = '';
    
    for (const [section, values] of Object.entries(data)) {
      result += `[${section}]\n`;
      for (const [key, value] of Object.entries(values)) {
        result += `${key}=${value}\n`;
      }
      result += '\n';
    }
    
    return result;
  }