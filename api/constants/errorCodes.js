//success code
const success = '0000'
//unknown error
const unknown = '0XXX'
// validation error code
const validation = '0001'
// Username Exist
const usernameExist = '0002'
// account not found
const accountNotFound = '0003'
// wrong password
const wrongPassword = '0004'
// account already suspended/unsuspended
const suspension = '0005'
// entity frozen
const frozen = '0006'
// task not found
const taskNotFound = '0007'
// task not found
const meetingNotFound = '0008'
//task not submitted
const notSubmit = '0009'
// author doesn't match task
const notMatch = '0010'
//attendance not found
const attendanceNotFound = '0011'
//application not found
const applicationNotFound = '0012'
module.exports = {
  success,
  validation,
  accountNotFound,
  usernameExist,
  suspension,
  frozen,
  wrongPassword,
  notSubmit,
  notMatch,
  attendanceNotFound,
  unknown,
  taskNotFound,
  meetingNotFound,
  applicationNotFound
}
