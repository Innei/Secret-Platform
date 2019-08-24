const readlineSync = require('readline-sync')
const fs = require('fs')
const domain = readlineSync.question('你的绑定的域名为: \n')
const key = readlineSync.question('设定你的验证 key: \n')
const obj = { domain, key }

fs.writeFile(
  __dirname + '/config.inc.js',
  'module.exports = ' + JSON.stringify(obj),
  { encoding: 'utf-8' },
  err => {
    if (err) {
      console.log('写入错误, 请检查权限\n', err)
    }
    console.log('写入成功')
  }
)
