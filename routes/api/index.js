const express = require('express')

module.exports = app => {
  const router = express.Router()

  
  app.use('/api', router)

  require('./user')(app)
  // require('./login')(app)

  router.use('/posts/', require('./posts'))
  router.use('/upload', require('./upload'))
  router.use('/options', require('./options'))
  // router.use('/options', require('./options'))
}
