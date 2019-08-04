const express = require('express')

const router = express.Router()

const taskController = require('../controllers/task.controller')

const { task_create, task_edit, task_view, task_freeze } = taskController

router.post('/create', task_create)
router.post('/edit', task_edit)
router.post('/view', task_view)
router.post('/freeze', task_freeze)

module.exports = router
