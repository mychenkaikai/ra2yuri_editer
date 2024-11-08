export interface Section {
  [key: string]: string
}

export interface Config {
  General: Section
  // ... 其他节的定义
  [key: string]: Section
} 