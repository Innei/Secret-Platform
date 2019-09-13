const express = require('express')
const User = require('./../../models/User')
const Config = require('../../models/Config')
const Post = require('../../models/Post.js')
const CheckUserIsExist = require('../../middlewares/CheckUserIsExist.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const auth = require('./../../middlewares/auth')()
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

    if (!Field) {
      await Config.create({
        name: 'User-Num',
        value: 1
      })
    } else {
      await Field.update({
        $inc: {
          value: 1
        }
      })
    }
    const model = await User.create({ uid, username, password })
    res.send(model)
  })

  router.get('/:id', CheckUserIsExist(), auth, async (req, res) => {
    const id = req.params.id
    const model = await User.findOne({ uid: id })
    res.send(model)
  })

  router.get('/get_info/:id', CheckUserIsExist(), auth, async (req, res) => {
    const user = await User.findOne({ uid: req.params.id })
    const posts = await Post.find({ author: user.username })
      .limit(5)
      .sort({ _id: -1 })

    // 生成响应数据
    const userInfo = {
      ...user._doc,
      recentlyPosts: posts
    }
    res.send(userInfo)
  })

  router.post('/login', async (req, res) => {
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
        const token = jwt.sign({ uid, username, id: user._id }, key)
        res.send({ msg: '验证成功', token })
      }
    } catch (err) {
      res.status(401).send({ msg: '验证失败' })
    }
  })
  app.use('/api/user', router)
}
