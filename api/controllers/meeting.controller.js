const {
  errorCreator,
  checkFrozen,
  validations,
  checkId,
  freezeEntity
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
  confirm
} = require('../helpers/meeting.helper')
const bodyValidator = require('../helpers/validations/meeting.validation')
const freezeValidator = require('../helpers/validations/general.validation')

const {
  validation,
  notFound,
  suspension,
  frozen,
  notMatch
} = require('../constants/errorCodes')

const meeting_create = async (req, res) => {
  try {
    const notValid = await validations(req, bodyValidator.createValidation)
    if (notValid) {
      return res
        .status(400)
        .send(errorCreator(validation, notValid.details[0].message))
    }
    const { authorId, taskId } = req.body
    const checkUser = await checkId('accounts', authorId)
    if (checkUser === 0) {
      return res.status(400).send(errorCreator(notFound, 'User not found'))
    }
    const checkSus = await checkSuspend(authorId, true)
    if (checkSus !== 0) {
      return res
        .status(400)
        .send(
          errorCreator(suspension, 'Account suspended, cannot create meeting')
        )
    }
    const checkFreezen = await checkFrozen('accounts', authorId, true)
    if (checkFreezen !== 0) {
      return res
        .status(400)
        .send(errorCreator(frozen, 'Account frozen, cannot create meeting'))
    }
    const checkTask = await checkId('tasks', taskId)
    if (checkTask === 0) {
      return res
        .status(400)
        .send(errorCreator(notFound, 'Task not found, cannot create meeting'))
    }
    const checkFreeze = await checkFrozen('tasks', taskId, true)
    if (checkFreeze !== 0) {
      return res
        .status(400)
        .send(errorCreator(frozen, 'Task frozen , cannot create meeting'))
    }
    const checkAuthor = await matchAuthor(authorId, taskId)
    if (checkAuthor === 0)
      return res
        .status(400)
        .send(
          errorCreator(
            notMatch,
            'Task does not belong to user, cannot create meeting'
          )
        )
    const meeting = await createMeeting(authorId)
    const attendance = await createAttendance(
      authorId,
      taskId,
      true,
      meeting.id
    )
    return res.json({ meeting, attendance })
  } catch (exception) {
    console.log(exception)
  }
}
const meeting_edit = async (req, res) => {
  try {
    const isValid = await validations(req, bodyValidator.addValidation)
    if (isValid) {
      return res
        .status(400)
        .send(errorCreator(validation, isValid.details[0].message))
    }
    const { newTasks, meetingId } = req.body
    const checkMeeting = await checkId('meetings', meetingId)
    if (checkMeeting === 0) {
      return res.status(400).send(errorCreator(notFound, 'Meeting not found'))
    }
    const checkFreeze = await checkFrozen('meetings', meetingId, true)
    if (checkFreeze !== 0) {
      return res
        .status(400)
        .send(errorCreator(frozen, 'meeting frozen can not edit '))
    }
    const tasks = await addTasks(newTasks, meetingId)
    return res.json({ tasks })
  } catch (exception) {
    console.log(exception)
  }
}
const meeting_confirm = async (req, res) => {
  try {
    const isValid = await validations(req, bodyValidator.confirmValidation)
    if (isValid) {
      return res
        .status(400)
        .send(errorCreator(validation, isValid.details[0].message))
    }
    const { userId, meetingId } = req.body
    const checkMeeting = await checkId('meetings', meetingId)
    if (checkMeeting === 0) {
      return res.status(400).send(errorCreator(notFound, 'Meeting not found'))
    }
    const checkFreeze = await checkFrozen('meetings', meetingId, true)
    if (checkFreeze !== 0) {
      return res
        .status(400)
        .send(errorCreator(frozen, 'meeting frozen can not edit '))
    }
    const checkAttend = await checkAttendance(userId, meetingId)
    if (checkAttend === 0) {
      return res.status(400).send(errorCreator(notFound, 'User not invited'))
    }
    const attend = await confirmMeeting(userId, meetingId)
    const checkFinalConfirm = await finalConfirm(meetingId)
    let meeting
    if (checkFinalConfirm.length === 0) {
      meeting = await confirm(meetingId)
    }
    return res.json({ attend, meeting })
  } catch (exception) {
    console.log(exception)
  }
}
const meeting_freeze = async (req, res) => {
  try {
    const isValid = await validations(req, freezeValidator.freezeValidations)
    if (isValid) {
      return res
        .status(400)
        .send(errorCreator(validation, isValid.details[0].message))
    }
    const { id, toFreeze } = req.body
    const checkMeeting = await checkId('meetings', id)
    if (checkMeeting === 0) {
      return res.status(400).send(errorCreator(notFound, 'Meeting not found'))
    }
    const checkFreeze = await checkFrozen('meetings', id, toFreeze)
    if (checkFreeze !== 0) {
      const fro = toFreeze ? 'frozen' : 'unfrozen'
      return res
        .status(400)
        .send(errorCreator(frozen, 'meeting already ' + fro))
    }
    const result = await freezeEntity('meetings', id, toFreeze)
    const attends = await freezeEntity('attendances', id, toFreeze)
    return res.json({ result, attends })
  } catch (exception) {
    console.log(exception)
  }
}
module.exports = {
  meeting_create,
  meeting_edit,
  meeting_confirm,
  meeting_freeze
}
