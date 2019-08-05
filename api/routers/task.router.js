const express = require('express')

const router = express.Router()

const taskController = require('../controllers/task.controller')

const {
  task_create,
  task_edit,
  task_view,
  task_freeze,
  accept_applicant,
  task_apply,
  task_completed,
  task_submit,
  task_get,
  task_get_id
} = taskController

router.post('/create', task_create)
router.post('/edit', task_edit)
router.post('/view', task_view)
router.post('/freeze', task_freeze)
router.post('/accept', accept_applicant)
router.post('/apply', task_apply)
router.post('/submit', task_submit)
router.post('/confirm', task_completed)
router.post('/getAll', task_get)
router.post('/getId', task_get_id)

module.exports = router
