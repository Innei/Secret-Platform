const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  uid: {
    type: Number,
    required: true
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
  options: {
    type: Object,
    default: {}
  }
})

module.exports = mongoose.model('User', Schema)
