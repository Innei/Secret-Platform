const express = require('express')
const User = require('./../../models/User')
const Config = require('../../models/Config')
module.exports = app => {
  const router = express.Router()

  router.post('/signup', async (req, res) => {
    const { username, password } = req.body
    // 查找用户是否已经存在
    const isExist = (await User.findOne({ username })) ? true : false

    if (isExist) {
      return res.send({ msg: '用户已存在', code: 1 })
    }
    const Field = await Config.findOne({ name: 'User-Num' })

    const uid = Field ? Number(Field.value) + 1 : 1

    const model = await User.create({ uid, username, password })
    res.send(model)
  })

  app.use('/api/user', router)
}
