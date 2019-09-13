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
  post: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Post'
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
    type: String
  },
  url: {
    type: String
  },
  parent: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Comment'
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
