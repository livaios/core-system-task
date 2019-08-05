const express = require('express')
const cors = require('cors')
const app = express()
const server = require('http').Server(express)
const io = require('socket.io')(server)

const loggerMiddleware = require('./api/middleware/logger')
const openSocket = require('./api/socket')
const accounts = require('../core-system-task/api/routers/account.router')
const tasks = require('../core-system-task/api/routers/task.router')
const meetings = require('../core-system-task/api/routers/meeting.router')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(loggerMiddleware)

app.use('/api/v1/accounts', accounts)
app.use('/api/v1/tasks', tasks)
app.use('/api/v1/meetings', meetings)

openSocket(io)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server up and running on ${port} 👍 .`))
