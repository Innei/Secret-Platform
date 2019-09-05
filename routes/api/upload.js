const express = require('express')

const auth = require('./../../middlewares/auth')

const router = express.Router()

router.get('/', async (req, res) => {
  return res.status(400).send({ msg: '错误的请求' })
})
const multer = require('multer')
const upload = multer({
  dest: __dirname + '/../../uploads'
})
router.post('/upload', auth(), upload.single('file'), (req, res) => {
  const file = req.file
  console.log(file)

  file.url = 'http://localhost:3000/uploads/' + file.filename
  res.send(file)
})
router.post('/', async (req, res) => {})
module.exports = router
