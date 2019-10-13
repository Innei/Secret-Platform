const express = require('express')
const asset = require('http-assert')
const User = require('../../models/User')
const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const auth = require('../../middlewares/auth')()
const checkCommentsField = require('./../../middlewares/checkCommentField')()
const router = express.Router({
  mergeParams: true
})

router
  .post('/', checkCommentsField, async (req, res) => {
    const body = req.body
    const pid = req.body.pid
    const author = await User.findOne({
      username: (await Post.findOne({ pid })).author
    })
    const cid = author.options.comments_total + 1

    const comments = await Comment.countDocuments({
      pid,
      key: new RegExp(`^${pid}#\\d\\d\\d$`)
    })

    body.cid = cid
    body.owner = author.username
    body.key = String(pid) + `#${String(comments + 1).padStart(3, 0)}`
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
  .get('/', auth, async (req, res) => {
    const page = req.query.page || 1
    const size = req.query.size || 10
    const state = req.query.state ? { state: Number(req.query.state) } : {}
    // 0 审核 1 发布 2 垃圾
    const query = await Comment.find(state)
      .skip((page - 1) * size)
      .limit(size)
      .sort({ createTime: -1 })
      .populate('post')
      .populate('parent')

    const totalPage = Math.ceil(
      (await Comment.countDocuments({ ...state, owner: req.username })) / size
    )
    const currentPage = Number(page)
    res.send({
      data: query,
      options: {
        totalPage,
        currentPage,
        hasNextPage: currentPage < totalPage ? true : false,
        hasPreviousPage: currentPage > 1 ? true : false,
        isFirst: currentPage === 1 ? true : false,
        isLast: currentPage === totalPage ? true : false
      }
    })
  })

  /**
   * 获取评论各类型的数量的接口
   */
  .get('/info', auth, async (req, res) => {
    const passed = await Comment.countDocuments({
      state: 1,
      owner: req.username
    })
    const gomi = await Comment.countDocuments({ state: 2, owner: req.username })
    const needChecked = await Comment.countDocuments({
      state: 0,
      owner: req.username
    })

    res.send({
      passed,
      gomi,
      needChecked
    })
  })

  .delete('/', auth, async (req, res) => {
    const id = req.query.id

    // 这里提供了两种删除方式 根据 _id 和 cid

    if (id) {
      const isCid = id.length !== 24 ? true : false
      var query, delCount
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
          // delCount = await delComments(query)
          if (query.hasChild) {
            delCount =
              (await Comment.deleteMany({
                key: new RegExp(`^${query.key}`, 'ig')
              })).deletedCount + 1
          }
          await User.updateOne(
            { username: req.username },
            {
              $inc: {
                'options.comments_nums': -(delCount || 1)
              }
            }
          )
          // 删除post中的comments数量
          query.post.comments -= delCount || 1
          await query.post.save()
        }

        return res.send({ ok: 1, n: 1, deleteCount: delCount || 1 })
      } catch (e) {
        console.log(e)
        return res.send({ ok: 0, msg: '参数不正确' })
      }
    }
    return res.send({ ok: 0, msg: '请输入正确的ID' })
  })

  .put('/', auth, async (req, res) => {
    const id = req.query.id
    const state = Number(req.query.state)
    if (!state || !id) {
      return res.status(400).send({ msg: '错误的请求' })
    }

    const isCid = id.length !== 24 ? true : false
    var query
    try {
      if (isCid) {
        query = await Comment.updateOne(
          {
            cid: id
          },
          { state }
        )
      } else {
        query = await Comment.updateOne(
          {
            _id: id
          },
          { state }
        )
      }

      return res.send(query)
    } catch (e) {
      console.log(e)
      return res.send({ ok: 0, msg: '参数不正确' })
    }
  })

  /**
   * 处理评论回复的路由
   */

  .post('/reply', checkCommentsField, async (req, res) => {
    // 父ID
    const cid = Number(req.body.cid)
    asset(cid, 400, '错误的请求')
    const parent = await Comment.findOne({ cid }).populate('post')
    asset(parent, 400, '不存在父评论')
    await parent.updateOne({
      hasChild: true
    })
    const author = await User.findOne({
      username: parent.post.author
    })
    const commentsPatents = await Comment.countDocuments({
      key: new RegExp(`^${parent.key}#\\d\\d\\d$`)
    })
    req.body.cid = author.options.comments_total + 1
    req.body.key = parent.key + `#${String(commentsPatents + 1).padStart(3, 0)}`
    const model = {
      parent,
      owner: parent.owner,
      post: new require('mongoose').Types.ObjectId(parent.post._id),
      ...req.body
    }
    const query = await Comment.create(model)
    parent.post.comments++
    await parent.post.save()
    await author.updateOne({
      $inc: {
        'options.comments_total': 1,
        'options.comments_nums': 1
      }
    })
    res.send({ ok: 1, query })
  })
  /**
   * 获取某文章下所有评论的接口(供访客使用)
   */
  .get('/:pid', async (req, res) => {
    const pid = Number(req.params.pid)
    asset(pid, 422, '无效的标识号')
    const data = await Comment.find({
      pid
    }).sort({ key: 1 })
    res.send({ ok: 1, data })
  })
module.exports = router
