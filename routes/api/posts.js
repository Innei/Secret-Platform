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
  const keyword = req.query.keyword || ''
  const state = Number(req.query.state) || -1

  // 文章状态 1 => 已发布 2 => 已过期 -1 => 未指定
  let status = {}

  switch (state) {
    case 1:
      status = {
        $and: [
          {
            $or: [
              {
                outdateTime: {
                  $gt: Date.now()
                }
              },
              { isOutdate: false }
            ]
          },
          {
            limitTime: { $ne: 0 }
          }
        ]
      }
      break
    case 2:
      status = {
        $or: [
          {
            $and: [
              {
                outdateTime: {
                  $lt: Date.now()
                }
              },
              { isOutdate: true }
            ]
          },
          { limitTime: 0 }
        ]
      }
      break
    default:
      break
  }
  /* const status =
    state === 2
      ? {
          $or: [
            {
              $and: [
                {
                  outdateTime: {
                    $lt: Date.now()
                  }
                },
                { isOutdate: true }
              ]
            },
            { limitTime: 0 }
          ]
        }
      : {
          $and: [
            {
              $or: [
                {
                  outdateTime: {
                    $gt: Date.now()
                  }
                },
                { isOutdate: false }
              ]
            },
            {
              limitTime: { $ne: 0 }
            }
          ]
        } */
  const model =
    keyword || state !== -1
      ? await Post.find({
          author: req.username,
          $or: [
            {
              title: new RegExp(keyword, 'ig')
            },
            { content: new RegExp(keyword, 'ig') }
          ],
          ...status
        }).sort({ modifyTime: 1 })
      : await Post.find({
          author: req.username
          // ...status
        })
          .skip((page - 1) * size)
          .limit(size)
          .sort({ modifyTime: 1 })

  const totalPage =
    keyword || state !== -1
      ? // ? Math.ceil(model.length / size)
        1
      : Math.ceil(
          (await User.findOne({ username: req.username })).options
            .publish_nums / size
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
        return res.status(404).send({ msg: '文章不存在' })
      }
    })
    .catch(err => {
      log(`IP: ${req.ip} try a invalid ID to query.\n ${chalk.yellow(err)}`, 2)
      return res.status(404).send({ msg: '文章不存在' })
    })
})

router.post(
  '/create',
  auth({
    // 增加到个人用户 文章发布数 等 其他信息的更新

    // 为 个人用户 更新 文章发布数 方法
    async func(model) {
      await model.updateOne({
        $inc: {
          ['options.publish_nums']: 1
        }
      })
    }
  }),
  async (req, res) => {
    const body = req.body
    body.author = req.username
    try {
      const model = await Post.create(body)

      return res.send(model)
    } catch (e) {
      console.log(e)
      res.send({ msg: '创建时出现错误', code: 1 })
    }
  }
)

router.put('/edit', auth(), async (req, res) => {
  
})
module.exports = router
