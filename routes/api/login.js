const express = require('express')
const User = require('./../../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

module.exports = app => {
  const router = express.Router()

  router.post('/', async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username }).select('+password')
    if (!user) {
      res.status(422).send({
        msg: '用户不存在',
        code: 422
      })
    }

    const isVerify = bcrypt.compareSync(password, user.password)
    try {
      if (isVerify) {
        const uid = user.uid
        const username = user.username
        const key = app.get('config').key
        const token = jwt.sign({ uid, username, id: user._id}, key)
        res.send({ msg: '验证成功', token })
      }
    } catch (err) {
      res.status(422).send({ msg: '验证失败' })
    }
  })
  app.use('/api/login', router)
}
