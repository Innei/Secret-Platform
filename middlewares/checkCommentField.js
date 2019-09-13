const User = require('../models/User')
const jwt = require('jsonwebtoken')

function getClientIP(req) {
  var ip =
    req.headers['x-forwarded-for'] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    ''
  if (ip.split(',').length > 0) {
    ip = ip.split(',')[0]
  }
  return ip
}
/**
 * 检查评论中是否存在 {author, content, email, pid}
 */
module.exports = options => {
  return async (req, res, next) => {
    const token = req.headers['authorization']
    const body = req.body
    if (!body.author) {
      return res.status(422).send({ msg: '姓名不能为空' })
    } else {
      const isExist = (await User.findOne({ username: body.author }))
        ? true
        : false
      if (isExist && !token) {
        
        return res.status(422).send({ msg: '该用户名已被占用' })
      }
    }
    if (!body.content) {
      return res.status(422).send({ msg: '内容不能为空' })
    }
    if (!body.email) {
      return res.status(422).send({ msg: '邮箱不能为空' })
    }
    if (!body.createTime) {
      body.createTime = Date.now()
    }
    if (!body.pid) {
      return res.status(422).send({ msg: '评论文章不能为空' })
    }

    if (!token) {
      req.body.isPoster = false
    } else {
      try {
        const obj = jwt.verify(token, req.app.get('config').key)
        const id = obj.id
        const model = await User.findById(id)
        if (model && model.username) {
          req.body.isPoster = model.username === body.author ? true : false
          req.body.state = req.body.isPoster ? 1 : 0
        }
      } catch (e) {
        return res.status(500).send({
          msg: '发生错误',
          code: 3
        })
      }
    }

    req.body.ipAddress = getClientIP(req)
    await next()
  }
}
