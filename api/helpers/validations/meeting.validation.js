const Joi = require('joi')

const createValidation = request => {
  const createSchema = {
    taskId: Joi.number().required(),
    authorId: Joi.number().required()
  }
  return Joi.validate(request, createSchema)
}
const addValidation = request => {
  const addSchema = {
    newTasks: Joi.array().items(Joi.number()),
    meetingId: Joi.number().required()
  }
  return Joi.validate(request, addSchema)
}
const confirmValidation = request => {
  const confirmSchema = {
    userId: Joi.number().required(),
    meetingId: Joi.number().required()
  }
  return Joi.validate(request, confirmSchema)
}
module.exports = { createValidation, addValidation, confirmValidation }
