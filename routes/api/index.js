const express = require('express')
const Post = require('../../models/Post')
const Config = require('../../models/Config')
const ip = require('../../middlewares/ip')()
const log = require('./../../plugins/log')
const chalk = require('chalk')
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
          return res.status(404).send({ msg: '页面不存在' })
        }
      })
      .catch(err => {
        log(
          `IP: ${req.ip} try a invalid ID to query.\n ${chalk.yellow(err)}`,
          2
        )
        return res.status(404).send({ msg: '页面不存在' })
      })
  })

  router.post('/', async (req, res) => {
    const body = req.body
    // console.log(body)
    // TODO 判断
    const model = await Post.create(body)
    res.send(model)
  })
  app.use('/api', router)
}
