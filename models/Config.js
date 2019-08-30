const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  value: {}
})

module.exports = mongoose.model('Config', Schema)
