const express = require('express')
const Post = require('../../models/Post')
const Config = require('../../models/Config')
const ip = require('../../middlewares/ip')()
const log = require('./../../plugins/log')
const chalk = require('chalk')
const auth = require('./../../middlewares/auth')
module.exports = app => {
  const router = express.Router()

  router.get('/', async (req, res) => {
    const model = await Post.find({})
    res.send(model)
  })
  router.get('/:id', ip, (req, res) => {
    const id = req.params.id
    Post.findById(id)
        .then(model => {
          if (model) {
            return res.send(model)
          } else {
            return res.status(404).send({msg: '页面不存在'})
          }
        })
        .catch(err => {
          log(
              `IP: ${req.ip} try a invalid ID to query.\n ${chalk.yellow(err)}`,
              2
          )
          return res.status(404).send({msg: '页面不存在'})
        })
  })

  router.post('/', auth(), async (req, res) => {
    const body = req.body
    try {
      const model = await Post.create(body)
      // 增加到个人用户 文章发布数 等 其他信息的更新

      // TODO 为 个人用户 更新 文章发布数

    } catch (e) {
      console.log(e)
      res.send({msg: '创建时出现错误', code: 1})
    }


  })
  app.use('/api', router)
}
