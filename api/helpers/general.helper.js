const { pool } = require('../../config/DBConfig')
const validator = require('../helpers/validations/general.validation')

const errorCreator = (code, message) => ({ error: { code, message } })

const validations = (req, specialValidator) => {
  try {
    const channel = req.headers['channel']
    const timestamp = req.headers['timestamp']
    const request_id = req.headers['request_id']
    const headerValid = validator.headerValidation({
      channel,
      timestamp,
      request_id
    })
    if (headerValid.error) return headerValid.error
    const bodyValid = specialValidator(req.body)
    if (bodyValid.error) {
      console.log(bodyValid.error.details[0].message)
      return bodyValid.error
    }
    return false
  } catch (exception) {
    console.log(exception)
  }
}
const checkId = async (table, id) => {
  try {
    const query = {
      text: 'SELECT * FROM ' + table + ' WHERE id = $1',
      values: [id]
    }
    const res = await pool.query(query)
    return res.rowCount
  } catch (err) {
    return err
  }
}
const checkFrozen = async (table, id, tofreeze) => {
  try {
    const query = {
      text: 'SELECT * FROM ' + table + ' WHERE id = $1 AND is_frozen = $2',
      values: [id, tofreeze]
    }
    const res = await pool.query(query)
    return res.rowCount
  } catch (err) {
    return err
  }
}
const freezeEntity = async (table, id, tofreeze) => {
  try {
    let query
    if (table === 'applications') {
      query = {
        text:
          'UPDATE ' +
          table +
          ' SET is_frozen = $2 WHERE task_id = $1 RETURNING *',
        values: [id, tofreeze]
      }
    }
    if (table === 'attendances') {
      query = {
        text:
          'UPDATE ' +
          table +
          ' SET is_frozen = $2 WHERE meeting_id = $1 RETURNING *',
        values: [id, tofreeze]
      }
    } else {
      query = {
        text:
          'UPDATE ' + table + ' SET is_frozen = $2 WHERE id = $1 RETURNING *',
        values: [id, tofreeze]
      }
    }
    const res = await pool.query(query)
    return res.rows
  } catch (exception) {
    console.log(exception)
  }
}

module.exports = {
  errorCreator,
  checkFrozen,
  validations,
  checkId,
  freezeEntity
}
