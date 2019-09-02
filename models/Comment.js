const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  // comment id
  cid: {
    type: Number,
    default: 1
  },
  // post id
  pid: {
    type: Number
  },
  content: {
    type: String
  },
  create_time: {
    type: Number,
    default: Date.now()
  },
  author: {
    type: String
  },
  author_id: {
    type: Number
  },
  owner_id: {
    type: Number
  },
  url: {
    type: String
  },
  parent: {
    type: Number
  }
})

module.exports = mongoose.model('Comment', schema)