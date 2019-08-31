const express = require('express')
const User = require('./../../models/User')
const Config = require('../../models/Config')
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

  router.get('/:id', async (req, res) => {

    const id = req.params.id
    assert(id, 422, '无效的 ID')
    const model = await User.findOne({uid: id})
    assert(model, 422, '不存在此用户')

    res.send(model)

  })
  app.use('/api/user', router)
}
