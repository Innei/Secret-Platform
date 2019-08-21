const express = require('express')
const log = require('./plugins/log')
const app = express()

app.use(require('cors')())
app.set('views', require('path').join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json())

require('./routes/api/index')(app)
require('./plugins/db')(app)
require('./routes/static/index')(app)
// app.get('/', (req, res) => {
//   res.redirect('/api')
// })
app.listen(3000, () => {
  log('Server is up, http://localhost:3000')
})
