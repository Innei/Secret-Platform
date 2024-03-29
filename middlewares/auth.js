const User = require('../models/User')
const jwt = require('jsonwebtoken')
/**
 * options => func 接受一个函数，用于处理用户模型
 * @param options
 * @return {Function}
 */
module.exports = (options = {}) => {
  /**
   * 验证是否为空的验证头，并将 Username 解密挂载到 req.username 上, uid 模型挂载到 req.uid
   *
   * @msg: String
   */
  return async (req, res, next) => {
    const token = req.headers['authorization']
    if (token === undefined) {
      return res.status(401).send({ msg: '空的验证头' })
    } else {
      let obj
      try {
        obj = jwt.verify(token, req.app.get('config').key)
      } catch (e) {
        if (e.message === 'invalid signature')
          res.status(401).send({ msg: '验证已过期' })
        else throw e
      }
      try {
        const id = obj.id
        const model = await User.findById(id)

        // 对模型进行操作的函数
        if (options.func) options.func(model, req, res)

        if (model && model.uid && model.username) {
          req.username = model.username
          req.uid = model.uid
        } else {
          return res.status(401).send({
            msg: '用户不存在'
          })
        }
      } catch (e) {
        console.log(e)
        return res.status(500).send({
          msg: '发生错误'
        })
      }
      next()
    }
  }
}
