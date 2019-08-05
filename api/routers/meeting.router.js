const express = require('express')

const router = express.Router()

const meetingController = require('../controllers/meeting.controller')

const {
  meeting_create,
  meeting_edit,
  meeting_confirm,
  meeting_freeze,
  meeting_get,
  meeting_get_id
} = meetingController

router.post('/create', meeting_create)
router.post('/edit', meeting_edit)
router.post('/confirm', meeting_confirm)
router.post('/freeze', meeting_freeze)
router.post('/getAll', meeting_get)
router.post('/getId', meeting_get_id)

module.exports = router
