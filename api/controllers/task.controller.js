const { pool } = require('../../config/DBConfig')

const {
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
  view,
  checkApp,
  acceptApp1,
  acceptApp2,
  addApp,
  submitText,
  checkSubmitted,
  confirmTask,
  viewAll
} = require('../helpers/task.helper')
const bodyValidator = require('../helpers/validations/task.validation')
const freezeValidator = require('../helpers/validations/general.validation')

const {
  success,
  validation,
  accountNotFound,
  suspension,
  frozen,
  notSubmit,
  unknown,
  taskNotFound,
  applicationNotFound
} = require('../constants/errorCodes')

const task_create = async (req, res) => {
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
    const { name, authorId } = req.body
    const checkUser = await checkId('accounts', authorId)
    if (checkUser === 0) {
      res.set({
        statusCode: accountNotFound,
        timestamp: new Date(),
        message: 'account not found'
      })
      return res.status(400).send()
    }
    const checkSus = await checkSuspend(authorId, true)
    if (checkSus !== 0) {
      res.set({
        statusCode: suspension,
        timestamp: new Date(),
        message: 'Account suspended, cannot create task'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('accounts', authorId, true)
    if (checkFreeze !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Account frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    const task = await create(authorId, name)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    return res.json({ task })
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
const task_edit = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.editValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { id, name } = req.body
    const checkTask = await checkId('tasks', id)
    if (checkTask === 0) {
      res.set({
        statusCode: taskNotFound,
        timestamp: new Date(),
        message: 'Task not found'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('tasks', id, true)
    if (checkFreeze !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Task frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    const result = await edit(id, name)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    return res.json({ result })
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
const task_view = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.viewValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const where = generateWhere(req.body)
    const orderBy = generateOrder(req.body)
    const values = generateValues(req.body)
    const views = await view(where, orderBy, values)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    return res.json(views.rows)
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
const task_freeze = async (req, res) => {
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
    const checkTask = await checkId('tasks', id)
    if (checkTask === 0) {
      res.set({
        statusCode: taskNotFound,
        timestamp: new Date(),
        message: 'Task not found'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('tasks', id, toFreeze)
    if (checkFreeze !== 0) {
      const fro = toFreeze ? 'frozen' : 'unfrozen'
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Task already' + fro
      })
      return res.status(400).send()
    }
    const applications = await freezeEntity('applications', id, toFreeze)
    const result = await freezeEntity('tasks', id, toFreeze)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    return res.json({ result, applications })
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
const accept_applicant = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.applicantValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { applicantId, taskId } = req.body
    const checkTask = await checkId('tasks', taskId)
    if (checkTask === 0) {
      res.set({
        statusCode: taskNotFound,
        timestamp: new Date(),
        message: 'Task not found'
      })
      return res.status(400).send()
    }
    const checkApplicant = await checkApp(taskId, applicantId)
    if (checkApplicant === 0) {
      res.set({
        statusCode: applicationNotFound,
        timestamp: new Date(),
        message: 'Application not found'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('tasks', taskId, true)
    if (checkFreeze !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Task frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    const task = await acceptApp1(taskId, applicantId)
    const application = await acceptApp2(taskId, applicantId)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    return res.json({ task, application })
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
const task_apply = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.applicantValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { applicantId, taskId } = req.body
    const checkUser = await checkId('accounts', applicantId)
    if (checkUser === 0) {
      res.set({
        statusCode: accountNotFound,
        timestamp: new Date(),
        message: 'account not found'
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
        message: 'Task frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    const checkFreezen = await checkFrozen('accounts', applicantId, true)
    if (checkFreezen !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Account frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    const checkSus = await checkSuspend(applicantId, true)
    if (checkSus !== 0) {
      res.set({
        statusCode: suspension,
        timestamp: new Date(),
        message: 'Account suspended, cannot apply for task'
      })
      return res.status(400).send()
    }
    const application = await addApp(taskId, applicantId)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    return res.json(application)
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
const task_submit = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.submitValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { taskId, text } = req.body
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
        message: 'Task frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    const task = await submitText(taskId, text, new Date())
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    return res.json(task)
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
const task_completed = async (req, res) => {
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
    const { taskId } = req.body
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
        message: 'Task frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    const checkSubmit = await checkSubmitted(taskId)
    if (checkSubmit === 0) {
      res.set({
        statusCode: notSubmit,
        timestamp: new Date(),
        message: 'Task not submitted'
      })
      return res.status(400).send()
    }

    const task = await confirmTask(taskId)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    return res.json(task)
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
const task_get = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const tasks = await viewAll()
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id']
    })
    await pool.query('COMMIT')
    res.json({ tasks })
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
  task_create,
  task_edit,
  task_view,
  task_freeze,
  accept_applicant,
  task_apply,
  task_submit,
  task_completed,
  task_get
}
