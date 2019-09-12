const express = require('express')
const User = require('../../models/User')
const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const auth = require('../../middlewares/auth')()
const checkCommentsField = require('./../../middlewares/checkCommentField')()
const router = express.Router({
  mergeParams: true
})

router.post('/', checkCommentsField, async (req, res) => {
  const body = req.body
  const pid = req.body.pid
  const author = await User.findOne({
    username: (await Post.findOne({ pid })).author
  })
  const cid = author.options.comments_total + 1
  body.cid = cid

  const post = await Post.findOne({ pid })

  try {
    const query = await Comment.create(body)
    // 关联文章模型
    if (post) {
      query.post = post
      await query.save()
      // 增加Post中的数量
      post.comments += 1
      await post.save()
    }
    await author.updateOne({
      $inc: {
        'options.comments_total': 1,
        'options.comments_nums': 1
      }
    })
    return res.send({
      ok: 1,
      ...query.toObject()
    })
  } catch (e) {
    console.log(e)
    return res.status(500).send({ ok: 0, ...req.body })
  }
})
router.get('/', auth, async (req, res) => {
  const page = req.query.page || 1
  const size = req.query.size || 20
  const state = req.query.state ? { state: Number(req.query.state) } : {}
  // 0 审核 1 发布 2 垃圾
  const query = await Comment.find(state)
    .skip((page - 1) * size)
    .limit(size)
    .sort({ createTime: -1 })
    .populate('post')
  res.send(query)
})

router.delete('/', auth, async (req, res) => {
  const id = req.query.id

  // 这里提供了两种删除方式 根据 _id 和 cid

  if (id) {
    const isCid = id.length !== 24 ? true : false
    var query
    try {
      if (isCid) {
        query = await Comment.findOneAndDelete({
          cid: id
        }).populate('post')
      } else {
        query = await Comment.findOneAndDelete({
          _id: id
        }).populate('post')
      }

      if (query) {
        await User.updateOne(
          { username: req.username },
          {
            $inc: {
              'options.comments_nums': -1
            }
          }
        )
        // 删除post中的comments数量
        query.post.comments--
        await query.post.save()
      }

      return res.send({ ok: 1, n: 1, deleteCount: 1 })
    } catch (e) {
      console.log(e)
      return res.send({ ok: 0, msg: '参数不正确' })
    }
  }
  return res.send({ ok: 0, msg: '请输入正确的ID' })
})
module.exports = router
