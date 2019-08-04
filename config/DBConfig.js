const { Pool } = require('pg')

const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'TaskManagement',
  password: 'linalina',
  port: 5432
}

const pool = new Pool(config)

module.exports = { pool }
