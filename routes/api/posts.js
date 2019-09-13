const express = require('express')
const Post = require('../../models/Post')
const Config = require('../../models/Config')
const User = require('./../../models/User')
const Comment = require('../../models/Comment')

const ip = require('../../middlewares/ip')()
const auth = require('./../../middlewares/auth')
const log = require('./../../plugins/log')
const checkPostField = require('../../middlewares/checkPostField')

const chalk = require('chalk')
const router = express.Router({ mergeParams: true })

// router.get('/', async (req, res) => {
//   const model = await Post.find({})
//   res.send(model)
// })
router.get('/list', auth(), async (req, res) => {
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
        }).sort({ modifyTime: -1 })
      : await Post.find({
          author: req.username
          // ...status
        })
          .skip((page - 1) * size)
          .limit(size)
          .sort({ modifyTime: -1 })

  const totalPage =
    keyword || state !== -1
      ? // ? Math.ceil(model.length / size)
        1
      : Math.ceil((await Post.countDocuments()) / size)
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

router.get('/', ip, (req, res) => {
  const id = req.query.id
  Post.findById(id)
    .then(async model => {
      if (model) {
        // 转换 mongoose 对象为纯 object 对象
        const doc = model.toObject()
        if (model.pid && model.state === 1) {
          const findDraft = await Post.findOne({ pid: model.pid, state: 0 })
          if (findDraft) {
            doc.hasDraft = 1
            doc.draftId = findDraft._id
          }
        }
        return res.send(doc)
      } else {
        return res.status(404).send({ msg: '文章不存在' })
      }
    })
    .catch(err => {
      log(`IP: ${req.ip} try a invalid ID to query.\n ${chalk.yellow(err)}`, 2)
      return res.status(404).send({ msg: '文章不存在' })
    })
})

router.post('/create', checkPostField(), auth(), async (req, res) => {
  const body = req.body
  body.author = req.username
  body.createTime = body.modifyTime = Date.now()
  try {
    const user = await User.findOne({ uid: req.uid })
    const pid = user.options.publish_total + 1
    let model
    body.pid = pid
    // 判断是否存在草稿
    if (body.state === 0) {
      const hasDraft = await Post.findOne({ pid })
      if (!hasDraft) {
        const pub = Object.assign({}, body)
        delete pub._id
        pub.state = 1
        model = await Post.create(pub)
        await Post.deleteOne({ _id: body._id })
      }
    }
    body.state = 1

    model = model || (await Post.create(body))
    await user.updateOne({
      $inc: {
        ['options.publish_nums']: 1,
        ['options.publish_total']: 1
      }
    })
    return res.send(model)
  } catch (e) {
    console.log(e)
    res.status(500).send({ msg: '创建时出现错误', code: 1 })
  }
})

router.put('/edit', checkPostField(), auth(), async (req, res) => {
  const id = req.query.id
  const update = req.query.update || false
  const pid = req.query.pid || null
  if (!id) {
    return res.status(404).send({ msg: '文章不存在' })
  }
  try {
    const body = req.body
    body.modifyTime = Date.now()
    if (update && pid) {
      delete body._id
      delete body.state
      // 更新文章
      await Post.updateOne({ pid: Number(pid), state: 1 }, body)
      // 删除草稿 (可选)
      await Post.deleteOne({ _id: id })

      return res.send({ ok: 1 })
    }
    const model = await Post.findOneAndUpdate(
      { _id: new require('mongoose').Types.ObjectId(id) },
      body
    )
    // 删除草稿
    await Post.deleteOne({ pid: model.pid, state: 0 })
    res.send({ ok: 0 })
  } catch (e) {
    res.status(500).send({ ok: 0 })
  }
})

router.delete('/', auth(), async (req, res) => {
  const id = req.query.id
  if (!id) {
    return res.status(400).send({ ok: 0, msg: '参数不正确' })
  }
  try {
    const user = await User.findOne({ uid: req.uid })
    const model = await Post.findOneAndDelete({
      _id: new require('mongoose').Types.ObjectId(id),
      author: req.username
    })

    // 删除对应的评论
    const delQuery = await Comment.deleteMany({ pid: model.pid })

    if (model && model.state === 1) {
      await user.updateOne({
        $inc: {
          ['options.publish_nums']: -1,
          ['options.comments_nums']: -delQuery.deletedCount || 0
        }
      })

      res.send({ ok: 1 })
    } else {
      return res.status(400).send({ ok: 0, msg: '找不到对应的文章' })
    }
  } catch (e) {
    return res.status(500).send({ ok: 0 })
  }
})

// 保存与草稿
router.post('/save', checkPostField(), auth(), async (req, res) => {
  const id = req.query.id
  const isDraft = Number(req.query.draft) === 1 ? true : false
  const body = req.body
  body.author = req.username
  body.state = 0
  body.modifyTime = Date.now()

  // 已存在文章 则创建副本
  try {
    if (id && !isDraft) {
      // 创建副本
      const pid = (await Post.findById(id)).pid
      body.pid = pid
      // 判断是否已存在草稿
      const draftQuery = await Post.findOne({ pid, state: 0 })
      const isExistDraft = draftQuery ? true : false
      delete body._id
      // 如果已存在草稿
      if (isExistDraft) {
        await draftQuery.update(body)
      } else {
        await Post.create(body)
      }
    } else if (id && isDraft) {
      const model = await Post.findById(id)
      if (model) {
        await model.update(body)
      }
    } else {
      await Post.create(body)
    }
  } catch (e) {
    console.log(e)
    res.status(400).send({ ok: 0 })
  }

  res.send({ ok: 1 })
})

router.use('/comments', require('./comments'))
module.exports = router
