const express = require('express')

const router = express.Router()

const meetingController = require('../controllers/meeting.controller')
const cache = require('../cache')
const {
  meeting_create,
  meeting_edit,
  meeting_confirm,
  meeting_freeze,
  meeting_get,
  meeting_get_id,
  meeting_get_attends
} = meetingController

router.post('/create', meeting_create)
router.post('/edit', meeting_edit)
router.post('/confirm', meeting_confirm)
router.post('/freeze', meeting_freeze)
router.get('/getAll', cache(10), meeting_get)
router.post('/getId', meeting_get_id)
router.post('/getAttends', meeting_get_attends)
module.exports = router
