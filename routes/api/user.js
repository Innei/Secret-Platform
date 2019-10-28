const express = require('express')
const User = require('./../../models/User')
const Config = require('../../models/Config')
const Post = require('../../models/Post.js')
const CheckUserIsExist = require('../../middlewares/CheckUserIsExist.js')
const auth = require('./../../middlewares/auth')()

const assert = require('http-assert')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
module.exports = app => {
  const router = express.Router()

  router
      .post('/signup', async (req, res) => {
        const document = await Config.findOne({ name: 'User-Num' })
        if (
            req.app.get('config').singleMode === true &&
            document && document.value > 0
        ) {
          return res.send({
            msg: '不允许注册!',
            ok: 0
          })
        }
        const { username, password } = req.body
        // 查找用户是否已经存在
        const isExist = (await User.findOne({ username })) ? true : false
        if (isExist) {
          return res.send({
            msg: '用户已存在',
            code: 1
          })
        }
        const uid = document ? Number(document.value) + 1 : 1

        if (!document) {
          await Config.create({
            name: 'User-Num',
            value: 1
          })
        } else {
          await document.update({
            $inc: {
              value: 1
            }
          })
        }
        const model = await User.create({
          uid,
          username,
          password
        })
        res.send({
          model,
          ok: 1
        })
      })

      .get('/', CheckUserIsExist(), auth, async (req, res) => {
        const id = req.query.id
        assert(id, 400, '用户ID有误')
        const model = await User.findOne({ uid: id })
        res.send(model)
      })

      .get('/get_info/:id', CheckUserIsExist(), auth, async (req, res) => {
        const user = await User.findOne({ uid: req.params.id })
        const recentlyPosts = await Post.find({ author: user.username })
            .limit(5)
            .sort({ modifyTime: -1 })
        const recentlyComments = await require('../../models/Comment')
            .find({
              owner: user.username,
              $or: [{ state: 1 }, { state: 0 }]
            })
            .limit(5)
            .sort({
              cid: -1
            })
        // 生成响应数据
        const userInfo = {
          ...user._doc,
          recentlyPosts,
          recentlyComments
        }
        res.send(userInfo)
      })

      .post('/login', async (req, res) => {
        const { username, password } = req.body
        const user = await User.findOne({ username }).select('+password')
        if (!user) {
          return res.status(422).send({
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
            const token = jwt.sign({
              uid,
              username,
              id: user._id
            }, key,
            {
              expiresIn: '7d'
            })
            return res.send({
              msg: '验证成功',
              token,
              uid: user.uid
            })
          }
        } catch (err) {
          return res.status(401).send({ msg: '验证失败' })
        }
        return res.status(401).send({ msg: '验证失败' })
      })

      .get('/info', async (req, res) => {
        const hasUser = await User.find({})
        if (hasUser.length === 0) {
          return res.send({
            msg: '不存在用户',
            ok: 0
          })
        }

        res.send({
          time: Date.now(),
          ok: 1
        })
      })

      .post('/reset', auth, async (req, res) => {
        const { password, newPassword } = req.body
        assert(password, 422, '请输入旧密码')
        assert(newPassword, 422, '请输入新密码')
        assert(password !== newPassword, 422, '新密码不能重复')
        const row = await User.findOne({ uid: req.uid }).select('+password')

        assert(bcrypt.compareSync(password, row.password), 422, '密码不匹配')
        const uid = req.uid
        const exec = await User.updateOne({ uid }, { password: newPassword })
        require('../../plugins/refreshKey')(app)
        res.send(exec)
      })

      .put('/update', auth, async (req, res) => {
        const { username, email } = req.body
        assert(username, 422, '用户名不能为空')
        const model = await User.findOne({ uid: req.uid })
        const r = await model.update({
          $set: {
            username,
            email
          }
        })
        res.send(r)
      })
  app.use('/api/user', router)
}
