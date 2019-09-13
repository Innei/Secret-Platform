const chalk = require('chalk')
const moment = require('moment')
const log = require('../plugins/log')
const Access = require('../models/Access')

function getClientIP(req) {
  var ip =
    req.headers['x-forwarded-for'] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    ''
  if (ip.split(',').length > 0) {
    ip = ip.split(',')[0]
  }
  return ip
}

module.exports = (options = {}) => {
  return async (req, res, next) => {
    // 时间
    const dUNIX = new Date()
    const day = dUNIX.getDate()
    const month = dUNIX.getMonth() + 1
    const year = dUNIX.getFullYear()
    const formatTime = moment(dUNIX).format('YYYY-MM-DD HH:mm:ss')
    // 获取 ip
    const ip = getClientIP(req)
    const recordAccess = req.app.get('config').recordAccess
    if (recordAccess) {
      await Access.create({
        time: Date.now(dUNIX),
        formatTime,
        ip,
        path: req.originalUrl,
        method: req.method,
        fullDate: {
          year,
          month,
          day
        }
      })
    }
    // console.log(`[${chalk.yellow(formatTime)}] 来源IP ${chalk.green(ip)}`)
    log(
      `From IP ${chalk.green(ip)} to ${req.method} ${req.originalUrl} ${
        options.msg ? `:${options.msg}` : ''
      }`,
      0
    )
    req.ip = ip
    await next()
  }
}
