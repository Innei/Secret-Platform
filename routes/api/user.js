const express = require('express')
const User = require('./../../models/User')
const Config = require('../../models/Config')
module.exports = app => {
  const router = express.Router()

  router.post('/signup', async (req, res) => {
    const { username, password } = req.body
    const Field = await Config.findOne({ name: 'User-Num' })

    const uid = Field ? Number(Field.value) + 1 : 1

    const model = await User.create({ uid, username, password })
    res.send(model)
  })

  app.use('/api/user', router)
}
