const generalHelpers = require('./helpers/general.helper')
const accountHelpers = require('./helpers/accounts.helper')
const taskHelpers = require('./helpers/task.helper')
const meetingHelpers = require('./helpers/meeting.helper')

const helpers = {
  ...generalHelpers,
  ...accountHelpers,
  ...taskHelpers,
  ...meetingHelpers
}
const openSocket = io => {
  io.on('connection', socket => {
    socket.on('callHelper', async data => {
      try {
        const obj = JSON.parse(data)
        const { helperName, ...inputValues } = obj
        const helperArguments = Object.values(inputValues)
        const result = await helpers[helperName](...helperArguments)
        socket.emit('returnValue', { data: result })
      } catch (e) {
        socket.emit('returnValue', { data: 'Something went wrong' })
      }
    })
    console.log('in')
  })
}
// credits to Youssef Sherif for exposing the functions

module.exports = openSocket
