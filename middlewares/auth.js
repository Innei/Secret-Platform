const User = require('../models/User')
const jwt = require('jsonwebtoken')
module.exports = (options) => {
  /**
   * 验证是否为空的验证头，并将 Username 解密挂载到 req.username 上, user 模型挂载到 req.user_mod
   *
   * @code: Number => 1: blank Authorization Header, 2: Invalid User， 3: verify crashed
   * @msg: String
   */
  return async (req, res, next) => {

    const token = req.headers['authorization']
    if (token === undefined) {
      return res.status(422).send({msg: '空的验证头', code: 1})
    } else {
      const obj = jwt.verify(token, req.app.get('config').key)
      try {
        const id = obj.id
        const model = (await User.findById(id))
        if (model && model.uid && model.username) {
          req.username = model.username
          req.user_mod = model
        } else {
          return res.status(422).send({
            msg: '用户不存在',
            code: 2
          })
        }
      } catch (e) {
        return res.status(500).send({
          msg: '发生错误',
          code: 3
        })
      }
      next()
    }
  }
}