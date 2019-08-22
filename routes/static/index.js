const express = require('express')
const Post = require('../../models/Post')
const Config = require('../../models/Config')
const ip = require('../../middlewares/ip')()
const log = require('./../../plugins/log')
const moment = require('moment')
const chalk = require('chalk')
const markdown = require('markdown-it')
const md = new markdown()
module.exports = app => {
  const router = express.Router()

  router.get('/', (req, res) => {
    res.render('index')
  })
  router.get('/:id', ip, async (req, res) => {
    const id = req.params.id
    await Post.findById(id)
      .then(model => {
        if (
          model &&
          model.limitTime !== 0 &&
          (!model.isOutdate || Number(model.outdateTime) - Date.now() > 0)
        ) {
          const render = Object.assign({}, model._doc)
          // console.log(render)
          model.limitTime--
          model.save()
          render.createTime = moment(
            +new Date(Number(model.createTime))
          ).format('LL')
          render.content = md.render(model.content)

          return res.render('post', render)
        } else {
          if (
            (model.limitTime === 0 && !model.isOutdate) ||
            Number(model.outdateTime) - Date.now() < 0
          ) {
            return res.status(404).send({ msg: '页面已过期' })
          }
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
  app.use('/posts/', router)
}
