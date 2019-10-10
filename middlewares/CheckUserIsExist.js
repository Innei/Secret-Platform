const assert = require('http-assert')
const User = require('../models/User')
module.exports = options => {
  return async (req, res, next) => {
    const id = req.query.id || req.params.id
    assert(id, 401, '无效的 ID')
    const model = await User.findOne({ uid: id })
    assert(model, 401, '不存在此用户')
    next()
  }
}
