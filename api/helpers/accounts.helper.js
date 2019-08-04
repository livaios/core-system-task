const { pool } = require('../../config/DBConfig')

const checkUsername = async username => {
  try {
    const query = {
      text: 'SELECT * FROM accounts WHERE username = $1',
      values: [username]
    }
    const res = await pool.query(query)
    return res.rowCount
  } catch (err) {
    return err
  }
}
const checkSuspend = async (id, toSuspend) => {
  try {
    const query = {
      text: 'SELECT * FROM accounts WHERE id = $1 AND is_suspended = $2',
      values: [id, toSuspend]
    }
    const res = await pool.query(query)
    return res.rowCount
  } catch (err) {
    return err
  }
}
const sign_up = async (username, password) => {
  try {
    const query = {
      text:
        'INSERT INTO accounts(username, password) VALUES($1, $2) RETURNING *',
      values: [username, password]
    }
    const res = await pool.query(query)
    return res.rows[0]
  } catch (exception) {
    return exception
  }
}
const suspending = async (id, toSuspend) => {
  try {
    const query = {
      text: 'UPDATE accounts SET is_suspended = $2 WHERE id = $1 RETURNING *',
      values: [id, toSuspend]
    }
    const res = await pool.query(query)
    return res.rows[0]
  } catch (exception) {
    return exception
  }
}
const checkCredentials = async (username, password) => {
  try {
    const query = {
      text: 'SELECT * FROM accounts WHERE username = $1 AND password = $2',
      values: [username, password]
    }
    const res = await pool.query(query)
    return res
  } catch (err) {
    return err
  }
}
const view = async () => {
  try {
    const query = {
      text:
        'SELECT * FROM accounts a INNER JOIN tasks t ON a.id = t.author_id WHERE a.is_frozen = false GROUP BY a.id,t.id'
    }
    const res = await pool.query(query)
    return res.rows
  } catch (err) {
    return err
  }
}

module.exports = {
  checkUsername,
  sign_up,
  suspending,
  checkSuspend,
  checkCredentials,
  view
}
