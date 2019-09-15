const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  uid: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String,
    require: true
  },
  password: {
    type: String,
    select: false,
    set(val) {
      return require('bcrypt').hashSync(val, 10)
    }
  },
  create_time: {
    type: String,
    default: String(Date.now())
  },
  email: {
    type: String
  },
  options: {
    type: Object,
    default: {
      publish_nums: 0,
      publish_total: 0,
      comments_total: 0,
      comments_nums: 0
    }
  }
})
Schema.index({ username: 1 })
Schema.index({ uid: 1 })
module.exports = mongoose.model('User', Schema)
