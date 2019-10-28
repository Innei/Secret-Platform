const User = require('../models/User')

module.exports = async app => {
  const config = { ...app.get('config') }
  if (config.singleMode) {
    const document = await User.findOne().select('+password')
    const key = document.password || (Math.random() * 1000).toString()
    config.key = key
    app.set('config', config)
  }
}
