const express = require('express')
const Post = require('../../models/Post')
const Config = require('../../models/Config')
const ip = require('../../middlewares/ip')()
const log = require('./../../plugins/log')
const chalk = require('chalk')
module.exports = app => {
  const router = express.Router()

  router.get('/', (req, res) => {
    res.render('index')
  })
  router.get('/:id', async (req, res) => {
    const id = req.params.id
    await Post.findById(id)
      .then(model => {
        if (model) {
          return res.render('post', model)
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
  app.use('/', router)
}
