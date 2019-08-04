const {
  errorCreator,
  checkFrozen,
  validations,
  checkId,
  freezeEntity
} = require('../helpers/general.helper')

const { checkSuspend } = require('../helpers/accounts.helper')
const {
  create,
  edit,
  generateWhere,
  generateOrder,
  generateValues,
  view
} = require('../helpers/task.helper')
const bodyValidator = require('../helpers/validations/task.validation')
const freezeValidator = require('../helpers/validations/general.validation')

const {
  validation,
  notFound,
  suspension,
  frozen
} = require('../constants/errorCodes')

const task_create = async (req, res) => {
  try {
    const notValid = await validations(req, bodyValidator.createValidation)
    if (notValid) {
      return res
        .status(400)
        .send(errorCreator(validation, notValid.details[0].message))
    }
    const { name, authorId } = req.body
    const checkUser = await checkId('accounts', authorId)
    if (checkUser === 0) {
      return res.status(400).send(errorCreator(notFound, 'User not found'))
    }
    const checkSus = await checkSuspend(authorId, true)
    if (checkSus !== 0) {
      return res
        .status(400)
        .send(errorCreator(suspension, 'Account suspended, cannot create task'))
    }
    const checkFreeze = await checkFrozen('accounts', authorId, true)
    if (checkFreeze !== 0) {
      return res
        .status(400)
        .send(errorCreator(frozen, 'Account frozen cannot view or edit'))
    }
    const task = await create(authorId, name)
    return res.json({ task })
  } catch (exception) {
    console.log(exception)
  }
}
const task_edit = async (req, res) => {
  try {
    const notValid = await validations(req, bodyValidator.editValidation)
    if (notValid) {
      return res
        .status(400)
        .send(errorCreator(validation, notValid.details[0].message))
    }
    const { id, name } = req.body
    const checkTask = await checkId('tasks', id)
    if (checkTask === 0) {
      return res.status(400).send(errorCreator(notFound, 'Task not found'))
    }
    const checkFreeze = await checkFrozen('tasks', id, true)
    if (checkFreeze !== 0) {
      return res
        .status(400)
        .send(errorCreator(frozen, 'Account frozen cannot view or edit'))
    }
    const result = await edit(id, name)
    return res.json({ result })
  } catch (exception) {
    console.log(exception)
  }
}
const task_view = async (req, res) => {
  try {
    const notValid = await validations(req, bodyValidator.viewValidation)
    if (notValid) {
      return res
        .status(400)
        .send(errorCreator(validation, notValid.details[0].message))
    }
    const where = generateWhere(req.body)
    const orderBy = generateOrder(req.body)
    const values = generateValues(req.body)
    const views = await view(where, orderBy, values)
    console.log(views)
    return res.json(views.rows)
  } catch (exception) {
    console.log(exception)
  }
}
const task_freeze = async (req, res) => {
  try {
    const notValid = await validations(req, freezeValidator.freezeValidations)
    if (notValid) {
      return res
        .status(400)
        .send(errorCreator(validation, notValid.details[0].message))
    }
    const { id, toFreeze } = req.body
    const checkTask = await checkId('tasks', id)
    if (checkTask === 0) {
      return res.status(400).send(errorCreator(notFound, 'Task not found'))
    }
    const checkFreeze = await checkFrozen('tasks', id, toFreeze)
    if (checkFreeze !== 0) {
      const fro = toFreeze ? 'frozen' : 'unfrozen'
      return res.status(400).send(errorCreator(frozen, 'task already ' + fro))
    }
    const applications = await freezeEntity('applications', id, toFreeze)
    const result = await freezeEntity('tasks', id, toFreeze)
    return res.json({ result, applications })
  } catch (exception) {
    console.log(exception)
  }
}
const accept_applicant = async (req, res) => {
  try {
  } catch (exception) {}
}
module.exports = { task_create, task_edit, task_view, task_freeze }
