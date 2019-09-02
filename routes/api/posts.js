const express = require('express')
const Post = require('../../models/Post')
const Config = require('../../models/Config')
const User = require('./../../models/User')

const ip = require('../../middlewares/ip')()
const log = require('./../../plugins/log')
const chalk = require('chalk')
const auth = require('./../../middlewares/auth')
const router = express.Router({ mergeParams: true })

// router.get('/', async (req, res) => {
//   const model = await Post.find({})
//   res.send(model)
// })
router.get('/', auth(), async (req, res) => {
  const page = req.query.page || 1
  const size = req.query.size || 10
  const model = await Post.find({ author: req.username })
    .skip((page - 1) * size)
    .limit(size)
    .sort({ modifyTime: 1 })
  const totalPage = Math.ceil(
    (await User.findOne({ username: req.username })).options.publish_nums / size
  )
  const currentPage = Number(page)
  res.send({
    options: {
      totalPage,
      currentPage,
      hasNextPage: currentPage < totalPage ? true : false,
      hasPreviousPage: currentPage > 1 ? true : false,
      isFirst: currentPage === 1 ? true : false,
      isLast: currentPage === totalPage ? true : false
    },
    data: model
  })
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
      log(`IP: ${req.ip} try a invalid ID to query.\n ${chalk.yellow(err)}`, 2)
      return res.status(404).send({ msg: '页面不存在' })
    })
})

router.post(
  '/create',
  auth({
    // 增加到个人用户 文章发布数 等 其他信息的更新

    // 为 个人用户 更新 文章发布数 方法
    async func(model) {
      await model.update({
        $inc: {
          ['options.publish_nums']: 1
        }
      })
    }
  }),
  async (req, res) => {
    const body = req.body
    try {
      const model = await Post.create(body)

      return res.send(model)
    } catch (e) {
      console.log(e)
      res.send({ msg: '创建时出现错误', code: 1 })
    }
  }
)

module.exports = router
