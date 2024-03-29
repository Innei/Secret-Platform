const readlineSync = require('readline-sync')
const fs = require('fs')
const domain = readlineSync.question(
  '你的绑定的域名为: (https://example.com) \n'
)
const recordAccess = readlineSync.question('是否开启IP访问记录: (Y/N) \n')
const singleMode = readlineSync.question('单用户使用?: (Y/N) \n')
const obj = {
  domain,
  recordAccess: recordAccess === 'Y' ? true : false,
  singleMode: singleMode === 'Y' ? true : false
}

function checkField(obj) {
  obj.domain = obj.domain || 'http://localhost'
}

checkField(obj)

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
