const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  // comment id
  cid: {
    type: Number,
    required: true,
    unique: true
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
  owner: {
    type: String,
    required: true
  },
  isOwner: {
    type: Boolean,
    required: true
  },
  email: {
    type: String
  },
  url: {
    type: String
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  parent: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Comment'
  },
  hasChild: { type: Boolean, default: false },
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
schema.index({ state: 1 })
schema.index({ cid: 1 })
schema.index({ parent: 1 })
schema.index({ key: 1 })
schema.index({ pid: 1 })
module.exports = mongoose.model('Comment', schema)
