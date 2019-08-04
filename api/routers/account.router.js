const express = require('express')

const router = express.Router()

const accountController = require('../controllers/account.controller')

const {
  account_signup,
  account_signin,
  account_suspend,
  account_freeze,
  account_get
} = accountController

router.post('/signup', account_signup)
router.post('/signin', account_signin)
router.post('/suspend', account_suspend)
router.post('/freeze', account_freeze)
router.post('/getAll', account_get)

module.exports = router
