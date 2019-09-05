module.exports = options => {
  return async (req, res, next) => {
    const body = req.body
    if (!body.title) {
      return res.status(422).send({ msg: '题目不能为空' })
    } else if (!body.content) {
      return res.status(422).send({ msg: '内容不能为空' })
    } else if (!body.createTime || !body.modifyTime) {
      body.modifyTime = body.createTime = Date.now()
    }
    next()
  }
}
