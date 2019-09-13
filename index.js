const express = require('express')
const log = require('./plugins/log')
const app = express()
const ip = require('./middlewares/ip')()
const chalk = require('chalk')
const bodyParser = require('body-parser')
try {
  const config = require('./config.inc.js')
  app.set('config', config)
} catch (err) {
  process.exit(-1, () => {
    return console.log(
      chalk.red('配置文件不存在, 请使用同目录下的 install.js 进行安装')
    )
  })
}

// 全局使用中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(require('cors')())
app.set('views', require('path').join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(ip)

app.use(express.json())

require('./routes/api/index')(app)
require('./plugins/db')(app)
require('./routes/static/index')(app)

app.use('/static', express.static('./static'))

app.listen(3000, () => {
  log('Server is up, http://localhost:3000')
})

// 全局错误处理
// require('express-async-errors')
app.use(async (err, req, res, next) => {
  res.status(err.statusCode || 500).send({
    msg: err.message || '未知错误'
  })
})
