const express = require('express')
const checkCommentsField = require('./../../middlewares/checkCommentField')()
const router = express.Router({
  mergeParams: true
})

router.post('/', checkCommentsField, async (req, res) => {
  
})

module.exports = router
