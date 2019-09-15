const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  pid: {
    type: Number,
    unique: true
  },
  author: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  // 创建时间
  createTime: {
    type: Number,
    default: Date.now()
  },
  modifyTime: {
    type: Number,
    default: Date.now()
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  // 是否过期
  isOutdate: {
    type: Boolean,
    default: false
  },
  // 过期时间 默认 7 天
  outdateTime: {
    type: Number,
    default: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).getTime()
  },
  // TODO 文章加密
  secret: {
    type: String,
    default: '',
    select: false,
    set(val) {
      if (val) {
        return require('bcrypt').hashSync(val, 10)
      }
    }
  },
  // 限制访问次数 默认不限制
  limitTime: {
    type: Number,
    default: -1
  },
  // 状态 0 => 草稿 1 => 发布
  state: {
    type: Number,
    default: 1
  },
  comments: {
    type: Number,
    default: 0
  }
})
schema.index({
  author: 1
})
schema.index({
  author: 1,
  pid: -1
})
schema.index({
  pid: -1,
  state: 1
})
module.exports = mongoose.model('Post', schema)
