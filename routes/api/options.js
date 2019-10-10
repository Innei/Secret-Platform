const express = require('express')
const auth = require('../../middlewares/auth.js')()
const User = require('../../models/User')
const router = express.Router()

router
    .get('/', auth, async (req, res) => {
      const row = await User.findOne({ uid: req.uid })
      const { options } = row
      res.send(options)
    })
    // 修改用户设置的路由
    .post('/', auth, async (req, res) => {
      const body = req.body
      const row = await User.findOne({
        uid: req.uid
      })
      const options = Object.entries(body)
      options.forEach(async (item, index) => {
        await row.update({
          $set: {
            [`options.${ item[0] }`]: item[1]
          }
        })
      })

      res.send(row.toObject())
    })

module.exports = router
