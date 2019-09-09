const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  // comment id
  cid: {
    type: Number,
    required: true
  },
  // post id
  pid: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createTime: {
    type: Number,
    default: Date.now()
  },
  author: {
    type: String,
    required: true
  },
  isPoster: {
    type: Boolean,
    required: true
  },
  email: {
    required: true,
    type: String
  },
  url: {
    type: String
  },
  parent: {
    type: Number
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  // 0 审核 1 发布 2 垃圾
  state: {
    type: Number,
    required: true,
    default: 0
  }
})

module.exports = mongoose.model('Comment', schema)
