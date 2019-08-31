const express = require('express')
const User = require('./../../models/User')
const Config = require('../../models/Config')
const Post = require('../../models/Post.js')
const CheckUserIsExist = require('../../middlewares/CheckUserIsExist.js')
const assert = require('http-assert')
module.exports = app => {
  const router = express.Router()

  router.post('/signup', async (req, res) => {
    const {username, password} = req.body
    // 查找用户是否已经存在
    const isExist = (await User.findOne({username})) ? true : false

    if (isExist) {
      return res.send({msg: '用户已存在', code: 1})
    }
    const Field = await Config.findOne({name: 'User-Num'})

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
    const model = await User.create({uid, username, password})
    res.send(model)
  })

  router.get('/:id', CheckUserIsExist(), async (req, res) => {
    const id = req.params.id
    const model = await User.findOne({uid: id})
    res.send(model)
  })

  router.get('/get_info/:id', CheckUserIsExist(), async (req, res) => {
    const user = await User.findOne({uid: req.params.id})
    const posts = await Post.find({author: user.username}).limit(5).sort({_id: -1})

    // 生成响应数据
    const userInfo = {
      ...user._doc,
      recentlyPosts: posts
    }
    res.send(userInfo)
  })
  app.use('/api/user', router)
}
