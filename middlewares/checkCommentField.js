module.exports = options => {
  return async (req, res, next) => {
    const body = req.body
    if (!body.author) {
      return res.status(422).send({ msg: '姓名不能为空' })
    } else if (!body.content) {
      return res.status(422).send({ msg: '内容不能为空' })
    } else if (!body.email) {
      return res.status(422).send({ msg: '邮箱不能为空' })
    } else if (!body.createTime || !body.modifyTime) {
      body.createTime = Date.now()
    } else if (!body.pid) {
      return res.status(422).send({ msg: '评论文章不能为空' })
    }

    next()
  }
}
