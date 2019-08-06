const { pool } = require('../../config/DBConfig')
const {
  checkFrozen,
  validations,
  checkId,
  freezeEntity,
  viewId
} = require('../helpers/general.helper')

const { checkSuspend } = require('../helpers/accounts.helper')
const {
  matchAuthor,
  createAttendance,
  createMeeting,
  addTasks,
  checkAttendance,
  confirmMeeting,
  finalConfirm,
  confirm,
  view,
  viewAllAttends
} = require('../helpers/meeting.helper')
const bodyValidator = require('../helpers/validations/meeting.validation')
const freezeValidator = require('../helpers/validations/general.validation')

const {
  success,
  validation,
  accountNotFound,
  suspension,
  frozen,
  notMatch,
  attendanceNotFound,
  unknown,
  taskNotFound,
  meetingNotFound
} = require('../constants/errorCodes')

const meeting_create = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.createValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { authorId, taskId } = req.body
    const checkUser = await checkId('accounts', authorId)
    if (checkUser === 0) {
      res.set({
        statusCode: accountNotFound,
        timestamp: new Date(),
        message: 'Account does not exist'
      })
      return res.status(400).send()
    }
    const checkSus = await checkSuspend(authorId, true)
    if (checkSus !== 0) {
      res.set({
        statusCode: suspension,
        timestamp: new Date(),
        message: 'Account suspended, cannot create meeting'
      })
      return res.status(400).send()
    }
    const checkFreezen = await checkFrozen('accounts', authorId, true)
    if (checkFreezen !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Account frozen, cannot create meeting'
      })
      return res.status(400).send()
    }
    const checkTask = await checkId('tasks', taskId)
    if (checkTask === 0) {
      res.set({
        statusCode: taskNotFound,
        timestamp: new Date(),
        message: 'Task not found'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('tasks', taskId, true)
    if (checkFreeze !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Task frozen, cannot create meeting'
      })
      return res.status(400).send()
    }
    const checkAuthor = await matchAuthor(authorId, taskId)
    if (checkAuthor === 0) {
      res.set({
        statusCode: notMatch,
        timestamp: new Date(),
        message: 'Task does not belong to user, cannot create meeting'
      })
      return res.status(400).send()
    }
    const meeting = await createMeeting(authorId)
    const attendance = await createAttendance(
      authorId,
      taskId,
      true,
      meeting.id
    )
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ meeting, attendance })
  } catch (exception) {
    await pool.query('ROLLBACK')
    res.set({
      statusCode: unknown,
      timestamp: new Date(),
      message: 'unknown error'
    })
    return res.status(400).send()
  }
}
const meeting_edit = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.addValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { newTasks, meetingId } = req.body
    const checkMeeting = await checkId('meetings', meetingId)
    if (checkMeeting === 0) {
      res.set({
        statusCode: meetingNotFound,
        timestamp: new Date(),
        message: 'meeting not found'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('meetings', meetingId, true)
    if (checkFreeze !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'meeting frozen can not edit'
      })
      return res.status(400).send()
    }
    const tasks = await addTasks(newTasks, meetingId)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ tasks })
  } catch (exception) {
    await pool.query('ROLLBACK')
    res.set({
      statusCode: unknown,
      timestamp: new Date(),
      message: 'unknown error'
    })
    return res.status(400).send()
  }
}
const meeting_confirm = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.confirmValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { userId, meetingId } = req.body
    const checkMeeting = await checkId('meetings', meetingId)
    if (checkMeeting === 0) {
      res.set({
        statusCode: meetingNotFound,
        timestamp: new Date(),
        message: 'meeting not found'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('meetings', meetingId, true)
    if (checkFreeze !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'meeting frozen can not edit'
      })
      return res.status(400).send()
    }
    const checkAttend = await checkAttendance(meetingId, userId)
    if (checkAttend === 0) {
      res.set({
        statusCode: attendanceNotFound,
        timestamp: new Date(),
        message: 'User not invited'
      })
      return res.status(400).send()
    }
    const attend = await confirmMeeting(meetingId, userId)
    const checkFinalConfirm = await finalConfirm(meetingId)
    let meeting
    if (checkFinalConfirm.length === 0) {
      meeting = await confirm(meetingId)
    }
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ attend, meeting })
  } catch (exception) {
    await pool.query('ROLLBACK')
    res.set({
      statusCode: unknown,
      timestamp: new Date(),
      message: 'unknown error'
    })
    return res.status(400).send()
  }
}
const meeting_freeze = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, freezeValidator.freezeValidations)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { id, toFreeze } = req.body
    const checkMeeting = await checkId('meetings', id)
    if (checkMeeting === 0) {
      res.set({
        statusCode: meetingNotFound,
        timestamp: new Date(),
        message: 'meeting not found'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('meetings', id, toFreeze)
    if (checkFreeze !== 0) {
      const fro = toFreeze ? 'frozen' : 'unfrozen'
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'meeting already ' + fro
      })
      return res.status(400).send()
    }
    const result = await freezeEntity('meetings', id, toFreeze)
    const attends = await freezeEntity('attendances', id, toFreeze)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ result, attends })
  } catch (exception) {
    await pool.query('ROLLBACK')
    res.set({
      statusCode: unknown,
      timestamp: new Date(),
      message: 'unknown error'
    })
    return res.status(400).send()
  }
}
const meeting_get = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const meetings = await view()
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ meetings })
  } catch (exception) {
    await pool.query('ROLLBACK')
    res.set({
      statusCode: unknown,
      timestamp: new Date(),
      message: 'unknown error'
    })
    return res.status(400).send()
  }
}
const meeting_get_id = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const meeting = await viewId('meetings', req.body.id)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ meeting })
  } catch (exception) {
    await pool.query('ROLLBACK')
    res.set({
      statusCode: unknown,
      timestamp: new Date(),
      message: 'unknown error'
    })
    return res.status(400).send()
  }
}
const meeting_get_attends = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const attend = await viewAllAttends(req.body.id)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ attend })
  } catch (exception) {
    await pool.query('ROLLBACK')
    res.set({
      statusCode: unknown,
      timestamp: new Date(),
      message: 'unknown error'
    })
    return res.status(400).send()
  }
}
module.exports = {
  meeting_create,
  meeting_edit,
  meeting_confirm,
  meeting_freeze,
  meeting_get,
  meeting_get_id,
  meeting_get_attends
}
