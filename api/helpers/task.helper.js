const { pool } = require('../../config/DBConfig')

const create = async (authorId, name) => {
  try {
    const query = {
      text: 'INSERT INTO tasks(author_id, name) VALUES($1, $2) RETURNING *',
      values: [authorId, name]
    }
    const res = await pool.query(query)
    return res.rows
  } catch (exception) {
    console.log(exception)
  }
}
const edit = async (id, name) => {
  try {
    const query = {
      text: 'UPDATE tasks SET name = $2 WHERE id = $1 RETURNING *',
      values: [id, name]
    }
    const res = await pool.query(query)
    return res.rows
  } catch (exception) {
    console.log(exception)
  }
}
const generateWhere = req => {
  try {
    const {
      name,
      authorId,
      assignedTo,
      submittedTask,
      endDate,
      isConfirmed,
      isFrozen
    } = req
    const whereClause = []
    if (name) whereClause.push('name = ')
    if (authorId) whereClause.push('author_id = ')
    if (assignedTo) whereClause.push('assigned_to = ')
    if (submittedTask) whereClause.push('submitted_task = ')
    if (endDate) whereClause.push('end_date = ')
    if (isConfirmed !== undefined) whereClause.push('is_confirmed = ')
    if (isFrozen !== undefined) whereClause.push('is_frozen = ')
    let whereString
    if (whereClause.length > 0) whereString = 'WHERE '
    else whereString = ''
    for (i = 0; i < whereClause.length; i++) {
      if (i !== whereClause.length - 1)
        whereString += whereClause[i] + ' $' + (i + 1) + ' AND '
      else whereString += whereClause[i] + ' $' + (i + 1)
    }
    return whereString
  } catch (exception) {
    console.log(exception)
  }
}
const generateOrder = req => {
  try {
    const { sortId, sortEndDate, sortApplicants } = req
    const orderClause = []
    if (sortId !== undefined) {
      if (sortId) orderClause.push('id ASC')
      else orderClause.push('id DESC')
    }
    if (sortEndDate !== undefined) {
      if (sortEndDate) orderClause.push('end_date ASC')
      else orderClause.push('end_date DESC')
    }
    let orderString
    if (orderClause.length > 0) orderString = 'ORDER BY '
    else orderString = ''
    for (i = 0; i < orderClause.length; i++) {
      if (i !== orderClause.length - 1) orderString += orderClause[i] + ', '
      else orderString += orderClause[i]
    }
    return orderString
  } catch (exception) {
    console.log(exception)
  }
}
const view = async (where, order, values) => {
  try {
    const query = {
      text:
        'SELECT * FROM tasks t LEFT OUTER JOIN applications a ON t.id = a.task_id ' +
        where +
        ' ' +
        order,
      values
    }
    console.log(query)
    const res = await pool.query(query)
    return res
  } catch (err) {
    return err
  }
}
const generateValues = req => {
  const {
    name,
    authorId,
    assignedTo,
    submittedTask,
    endDate,
    isConfirmed,
    isFrozen
  } = req
  const whereValues = []
  if (name) whereValues.push(name)
  if (authorId) whereValues.push(authorId)
  if (assignedTo) whereValues.push(assignedTo)
  if (submittedTask) whereValues.push(submittedTask)
  if (endDate) whereValues.push(endDate)
  if (isConfirmed !== undefined) whereValues.push(isConfirmed)
  if (isFrozen !== undefined) whereValues.push(isFrozen)
  return whereValues
}
const checkApp = async (taskId, applicantId) => {
  try {
    const query = {
      text: 'SELECT * FROM applications WHERE task_id = $1 AND user_id = $2',
      values: [taskId, applicantId]
    }
    const res = await pool.query(query)
    return res.rowCount
  } catch (err) {
    return err
  }
}
const acceptApp1 = async (taskId, applicantId) => {
  try {
    const query = {
      text: 'UPDATE tasks SET assigned_to = $2 WHERE id = $1 RETURNING *',
      values: [taskId, applicantId]
    }
    const res = await pool.query(query)
    return res.rows
  } catch (exception) {
    console.log(exception)
  }
}
const acceptApp2 = async (taskId, applicantId) => {
  try {
    const query = {
      text:
        'UPDATE applications SET is_accepted = true WHERE task_id = $1 AND user_id = $2 RETURNING *',
      values: [taskId, applicantId]
    }
    const res = await pool.query(query)
    return res.rows
  } catch (exception) {
    console.log(exception)
  }
}
const addApp = async (taskId, applicantId) => {
  try {
    const query = {
      text:
        'INSERT INTO applications(task_id, user_id) VALUES($1, $2) RETURNING *',
      values: [taskId, applicantId]
    }
    const res = await pool.query(query)
    return res.rows
  } catch (exception) {
    console.log(exception)
  }
}
const submitText = async (taskId, text, time) => {
  try {
    const query = {
      text:
        'UPDATE tasks SET submitted_task = $2, end_date = $3 WHERE id = $1 RETURNING *',
      values: [taskId, text, time]
    }
    const res = await pool.query(query)
    return res.rows
  } catch (exception) {
    console.log(exception)
  }
}
module.exports = {
  create,
  edit,
  generateWhere,
  generateOrder,
  generateValues,
  view,
  checkApp,
  acceptApp1,
  acceptApp2,
  addApp,
  submitText
}
