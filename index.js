const express = require('express')
const log = require('./plugins/log')
const app = express()
const fs = require('fs')
try {
  const config = require('./config.inc.js')
  app.set('config', config)
} catch (err) {
  console.log('配置文件不存在, 请使用同目录下的 install.js 进行安装')
}
app.use(require('cors')())
app.set('views', require('path').join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json())

require('./routes/api/index')(app)
require('./plugins/db')(app)
require('./routes/static/index')(app)
require('./routes/api/user')(app)
require('./routes/api/login')(app)

app.use('/static', express.static('./static'))
app.listen(3000, () => {
  log('Server is up, http://localhost:3000')
})
