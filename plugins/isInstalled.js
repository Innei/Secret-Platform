const fs = require('fs')

module.exports = options => {
  return () => {
    if (!fs.existsSync(__dirname + '/../config.inc.json')) {
      fs.writeFileSync(__dirname + '/../config.inc.json', '{}', {
        encoding: 'utf-8'
      })
    } else {
      fs.readFile(
        __dirname + '/../config.inc.json',
        {
          encoding: 'utf-8'
        },
        (err, res) => {
          console.log(JSON.parse(res))
        }
      )
    }
  }
}
