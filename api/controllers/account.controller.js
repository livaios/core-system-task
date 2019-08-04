const jwt = require('jsonwebtoken')

const bodyValidator = require('../helpers/validations/account.validation')
const freezeValidator = require('../helpers/validations/general.validation')

const {
  errorCreator,
  checkFrozen,
  validations,
  freezeEntity,
  checkId
} = require('../helpers/general.helper')
const {
  checkUsername,
  sign_up,
  checkSuspend,
  suspending,
  checkCredentials
} = require('../helpers/accounts.helper')
const {
  validation,
  usernameExist,
  suspension,
  frozen,
  wrongPassword
} = require('../constants/errorCodes')

const account_signup = async (req, res) => {
  try {
    const isValid = await validations(req, bodyValidator.credentialsValidation)
    if (isValid) {
      return res
        .status(400)
        .send(errorCreator(validation, isValid.details[0].message))
    }
    const { username, password } = req.body
    const checkUser = await checkUsername(username)
    if (checkUser !== 0) {
      return res
        .status(400)
        .send(errorCreator(usernameExist, 'Username must be unique'))
    }
    const user = await sign_up(username, password)
    return res.json({ user })
  } catch (exception) {
    console.log(exception)
  }
}
const account_signin = async (req, res) => {
  try {
    const isValid = await validations(req, bodyValidator.credentialsValidation)
    if (isValid) {
      return res
        .status(400)
        .send(errorCreator(validation, isValid.details[0].message))
    }
    const { username, password } = req.body
    const checkUser = await checkUsername(username)
    if (checkUser === 0) {
      return res
        .status(400)
        .send(errorCreator(usernameExist, 'Username does not exist'))
    }
    const checkCred = await checkCredentials(username, password)
    if (checkCred.rowCount === 0) {
      return res
        .status(400)
        .send(errorCreator(wrongPassword, 'Wrong password, sign in fail'))
    }
    const id = checkCred.rows[0].id
    const checkSus = await checkSuspend(id, true)
    if (checkSus !== 0) {
      return res
        .status(400)
        .send(errorCreator(suspension, 'Account suspended, sign in fail'))
    }
    const checkFreeze = await checkFrozen('accounts', id, true)
    if (checkFreeze !== 0) {
      return res
        .status(400)
        .send(errorCreator(frozen, 'Account frozen cannot view or edit'))
    }
    jwt.sign({ username, id }, 'privatekey', (err, token) => {
      if (err) {
        console.log(err)
      }
      res.send(token)
    })
  } catch (exception) {
    console.log(exception)
  }
}
const account_suspend = async (req, res) => {
  try {
    const isValid = await validations(req, bodyValidator.suspendValidation)
    if (isValid) {
      return res
        .status(400)
        .send(errorCreator(validation, isValid.details[0].message))
    }
    const { id, toSuspend } = req.body
    const checkUser = await checkId('accounts', id)
    if (checkUser === 0) {
      return res.status(400).send(errorCreator(userNotFound, 'User not found'))
    }
    const checkSus = await checkSuspend(id, toSuspend)
    const frozen = await checkFrozen('accounts', id, true)
    if (frozen !== 0) {
      return res
        .status(400)
        .send(errorCreator(frozen, 'Account frozen cannot view or edit'))
    }
    if (checkSus !== 0) {
      const sus = toSuspend ? 'suspended' : 'unsuspended'
      return res
        .status(400)
        .send(errorCreator(suspension, 'Account already ' + sus))
    }
    const result = await suspending(id, toSuspend)
    return res.json({ result })
  } catch (exception) {
    console.log(exception)
  }
}
const account_freeze = async (req, res) => {
  try {
    const isValid = await validations(req, freezeValidator.freezeValidations)
    if (isValid) {
      return res
        .status(400)
        .send(errorCreator(validation, isValid.details[0].message))
    }
    const { id, toFreeze } = req.body
    const checkUser = await checkId('accounts', id)
    if (checkUser === 0) {
      return res.status(400).send(errorCreator(notFound, 'User not found'))
    }
    const checkFreeze = await checkFrozen('accounts', id, toFreeze)
    if (checkFreeze !== 0) {
      const fro = toFreeze ? 'frozen' : 'unfrozen'
      return res
        .status(400)
        .send(errorCreator(frozen, 'account already ' + fro))
    }
    const result = await freezeEntity('accounts', id, toFreeze)
    return res.json({ result })
  } catch (exception) {
    console.log(exception)
  }
}
module.exports = {
  account_signup,
  account_suspend,
  account_signin,
  account_freeze
}
