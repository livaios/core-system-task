const express = require('express')
const cors = require('cors')

const app = express()

const accounts = require('./api/routers/account.router')
const tasks = require('./api/routers/task.router')
const applications = require('./api/routers/application.router')
const meetings = require('./api/routers/meeting.router')
const attendances = require('./api/routers/attendance.router')

const pool = require('./config/DBConfig')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/api/v1/accounts', accounts)
app.use('/api/v1/tasks', tasks)
//app.use('/api/v1/applications', applications)
//app.use('/api/v1/meetings', meetings)
//app.use('/api/v1/attendances', attendances)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server up and running on ${port} 👍 .`))
