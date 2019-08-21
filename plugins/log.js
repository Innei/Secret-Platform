const chalk = require('chalk')
const moment = require('moment')
module.exports = (msg, type = 0) => {
  const dUNIX = new Date()
  const formatTime = moment(dUNIX).format('YYYY-MM-DD HH:mm:ss')
  let notice
  switch (type) {
    case 0:
      notice = 'info'
      process.stdout.write(chalk.green(`[${notice.toUpperCase()}]`))
      break
    case 1:
      notice = 'warn'
      process.stdout.write(chalk.yellow(`[${notice.toUpperCase()}]`))
      break
    case 2:
      notice = 'high'
      process.stdout.write(chalk.red(`[${notice.toUpperCase()}]`))
      break
    default:
      notice = 'info'
      process.stdout.write(chalk.green(`[${notice.toUpperCase()}]`))
      break
  }
  process.stdout.write(`${chalk.yellow('[' + formatTime + ']')} ${msg}\n`)
}
