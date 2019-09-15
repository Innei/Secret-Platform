/**
 * 检查评论者是否为发布者
 * req.isOwner: true | false
 */
module.exports = options => {
  return async (req, res, next) => {
    const token = req.headers['authorization']
    if (!token) {
      req.isOwner = false
      return next()
    } else {
      
    }
  }
}
