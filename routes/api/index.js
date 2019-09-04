const express = require('express')

module.exports = app => {
  const router = express.Router()

  
  app.use('/api', router)

  require('./user')(app)
  // require('./login')(app)

  router.use('/posts/', require('./posts'))
}
