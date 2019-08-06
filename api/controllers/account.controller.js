const jwt = require('jsonwebtoken')
const { pool } = require('../../config/DBConfig')
const bodyValidator = require('../helpers/validations/account.validation')
const freezeValidator = require('../helpers/validations/general.validation')

const {
  checkFrozen,
  validations,
  freezeEntity,
  checkId,
  viewId
} = require('../helpers/general.helper')
const {
  checkUsername,
  sign_up,
  checkSuspend,
  suspending,
  checkCredentials,
  view
} = require('../helpers/accounts.helper')
const {
  success,
  validation,
  accountNotFound,
  usernameExist,
  suspension,
  frozen,
  wrongPassword,
  unknown
} = require('../constants/errorCodes')

const account_signup = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.credentialsValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { username, password } = req.body
    const checkUser = await checkUsername(username)
    if (checkUser !== 0) {
      res.set({
        statusCode: usernameExist,
        timestamp: new Date(),
        message: 'username already in use'
      })
      return res.status(400).send()
    }
    const user = await sign_up(username, password)

    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ user })
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
const account_signin = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.credentialsValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { username, password } = req.body
    const checkUser = await checkUsername(username)
    if (checkUser === 0) {
      res.set({
        statusCode: accountNotFound,
        timestamp: new Date(),
        message: 'Account does not exist'
      })
      return res.status(400).send()
    }
    const checkCred = await checkCredentials(username, password)
    if (checkCred.rowCount === 0) {
      res.set({
        statusCode: wrongPassword,
        timestamp: new Date(),
        message: 'Wrong password, sign in fail'
      })
      return res.status(400).send()
    }
    const id = checkCred.rows[0].id
    const checkSus = await checkSuspend(id, true)
    if (checkSus !== 0) {
      res.set({
        statusCode: suspension,
        timestamp: new Date(),
        message: 'Account suspended, sign in fail'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('accounts', id, true)
    if (checkFreeze !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Account frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    jwt.sign({ username, id }, 'privatekey', (err, token) => {
      if (err) {
        console.log(err)
      }
      res.send(token)
    })
    await pool.query('COMMIT')
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
const account_suspend = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const notValid = await validations(req, bodyValidator.suspendValidation)
    if (notValid) {
      res.set({
        statusCode: validation,
        timestamp: new Date(),
        message: notValid.details[0].message
      })
      return res.status(400).send()
    }
    const { id, toSuspend } = req.body
    const checkUser = await checkId('accounts', id)
    if (checkUser === 0) {
      res.set({
        statusCode: accountNotFound,
        timestamp: new Date(),
        message: 'User not found'
      })
      return res.status(400).send()
    }
    const checkSus = await checkSuspend(id, toSuspend)
    const frozen = await checkFrozen('accounts', id, true)
    if (frozen !== 0) {
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'Account frozen cannot view or edit'
      })
      return res.status(400).send()
    }
    if (checkSus !== 0) {
      const sus = toSuspend ? 'suspended' : 'unsuspended'
      res.set({
        statusCode: suspension,
        timestamp: new Date(),
        message: 'Account already ' + sus
      })
      return res.status(400).send()
    }
    const result = await suspending(id, toSuspend)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
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
const account_freeze = async (req, res) => {
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
    const checkUser = await checkId('accounts', id)
    if (checkUser === 0) {
      res.set({
        statusCode: accountNotFound,
        timestamp: new Date(),
        message: 'account not found'
      })
      return res.status(400).send()
    }
    const checkFreeze = await checkFrozen('accounts', id, toFreeze)
    if (checkFreeze !== 0) {
      const fro = toFreeze ? 'frozen' : 'unfrozen'
      res.set({
        statusCode: frozen,
        timestamp: new Date(),
        message: 'account already ' + fro
      })
      return res.status(400).send()
    }
    const result = await freezeEntity('accounts', id, toFreeze)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
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
const account_get = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const accounts = await view()
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ accounts })
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
const account_get_id = async (req, res) => {
  try {
    await pool.query('BEGIN')
    const account = await viewId('accounts', req.body.id)
    res.set({
      statusCode: success,
      timestamp: new Date(),
      request_id: req.headers['request_id'],
      message: 'success'
    })
    await pool.query('COMMIT')
    return res.json({ account })
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
  account_signup,
  account_suspend,
  account_signin,
  account_freeze,
  account_get,
  account_get_id
}
