const { pool } = require('../../config/DBConfig')

const matchAuthor = async (authorId, taskId) => {
  try {
    const query = {
      text: 'SELECT * FROM tasks WHERE id = $1 AND author_id = $2',
      values: [taskId, authorId]
    }
    const res = await pool.query(query)
    return res.rowCount
  } catch (err) {
    return err
  }
}
const createMeeting = async authorId => {
  try {
    const query = {
      text: 'INSERT INTO meetings(author_id) VALUES($1) RETURNING *',
      values: [authorId]
    }
    const res = await pool.query(query)
    return res.rows[0]
  } catch (err) {
    return err
  }
}
const createAttendance = async (authorId, taskId, isConfirmed, meetingId) => {
  try {
    const query = {
      text:
        'INSERT INTO attendances(user_id, task_id,meeting_id,is_confirmed) VALUES($1,$2,$3,$4) RETURNING *',
      values: [authorId, taskId, meetingId, isConfirmed]
    }
    const res = await pool.query(query)
    return res.rows[0]
  } catch (err) {
    return err
  }
}
const getUser = async taskId => {
  try {
    const query = {
      text:
        'SELECT assigned_to FROM tasks WHERE id = $1 AND assigned_to IS NOT NULL',
      values: [taskId],
      rowMode: 'array'
    }
    const res = await pool.query(query)
    return res.rows[0]
  } catch (err) {
    return err
  }
}
const addTasks = async (tasks, meetingId) => {
  try {
    const result = []
    for (i = 0; i < tasks.length; i++) {
      const user = await getUser(tasks[i])
      const one = await createAttendance(user[0], tasks[i], false, meetingId)
      result.push(one)
    }
    return result
  } catch (exception) {
    return exception
  }
}
const checkAttendance = async (meetingId, userId) => {
  try {
    const query = {
      text: 'SELECT * FROM attendances WHERE meeting_id = $1 AND user_id = $2',
      values: [meetingId, userId]
    }
    const res = await pool.query(query)
    return res.rowCount
  } catch (err) {
    return err
  }
}
const confirmMeeting = async (meetingId, userId) => {
  try {
    const query = {
      text:
        'UPDATE attendances SET is_confirmed = true WHERE user_id = $1 AND meeting_id =$2 RETURNING *',
      values: [userId, meetingId]
    }
    const res = await pool.query(query)
    return res.rows[0]
  } catch (exception) {
    return exception
  }
}
const finalConfirm = async meetingId => {
  try {
    const query = {
      text:
        'SELECT * FROM meetings m INNER JOIN attendances a ON m.id = a.meeting_id WHERE m.id =$1 AND a.is_confirmed = false',
      values: [meetingId]
    }
    const res = await pool.query(query)
    return res.rows
  } catch (exception) {
    return exception
  }
}
const confirm = async meetingId => {
  try {
    const query = {
      text: 'UPDATE meetings SET is_confirmed = true WHERE id =$1 RETURNING *',
      values: [meetingId]
    }
    const res = await pool.query(query)
    return res.rows[0]
  } catch (exception) {
    return exception
  }
}
const view = async () => {
  try {
    const query = {
      text:
        'SELECT * FROM meetings m INNER JOIN attendances a ON m.id = a.meeting_id WHERE m.is_frozen = false GROUP BY m.id,a.meeting_id,a.task_id'
    }
    const res = await pool.query(query)
    return res.rows
  } catch (err) {
    return err
  }
}
const viewAllAttends = async id => {
  try {
    const query = {
      text: 'SELECT * FROM attendances WHERE meeting_id = $1',
      values: [id]
    }
    const res = await pool.query(query)
    return res.rows
  } catch (err) {
    return err
  }
}
module.exports = {
  matchAuthor,
  createMeeting,
  createAttendance,
  addTasks,
  checkAttendance,
  confirmMeeting,
  finalConfirm,
  confirm,
  view,
  viewAllAttends
}
