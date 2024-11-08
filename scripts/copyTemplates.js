const fs = require('fs')
const path = require('path')

// 确保目标目录存在
const templateDir = path.join(__dirname, '../electron/templates')
if (!fs.existsSync(templateDir)) {
  fs.mkdirSync(templateDir, { recursive: true })
}

// 复制模板文件
fs.copyFileSync(
  path.join(__dirname, '../templates/Rulesmd.ini'),
  path.join(templateDir, 'Rulesmd.ini')
)