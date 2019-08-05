/**
 * This is a middleware file. Middlewares run before all/specific routes and subsequent controllers
 * get run.
 */
const MongoClient = require('mongodb').MongoClient
const moment = require('moment')
const uri =
  'mongodb+srv://lina:linalina@cluster0-u5qv5.mongodb.net/test?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true })
client.connect()

const logger = (req, res, next) => {
  console.log(
    `${req.protocol} to the route ${req.originalUrl} at ${moment().format()}`
  )
  res.on('finish', async () => {
    const logs = await client.db('core-system').collection('custom-log')
    logs.insertOne({
      protocol: req.protocol,
      serviceUrl: req.originalUrl,
      requestTimestamp: req.headers['timestamp'],
      requestId: req.headers['request_id'],
      resTimestamp: res.get('timestamp'),
      resMessage: res.get('message'),
      resStatus: res.get('statusCode')
    })
  })
  next()
}

module.exports = logger
