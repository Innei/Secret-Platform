const mongoose = require('mongoose')
const Config = require('./Config')
const schema = new mongoose.Schema({
  author: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  createTime: {
    type: String,
    default: String(Date.now())
  },
  modifyTime: {
    type: String
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isOutdate: {
    type: Boolean,
    default: false
  },
  outdateTime: {
    type: String,
    default: (new Date(Date.now() + 1000 * 60 * 60 * 24)).getTime()
  },
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
  limitTime: {
    type: Number,
    default: -1
  }
})
module.exports = mongoose.model('Post', schema)
