const Joi = require('joi')

const credentialsValidation = request => {
  const userSchema = {
    username: Joi.string().required(),
    password: Joi.string().required()
  }
  return Joi.validate(request, userSchema)
}
const suspendValidation = request => {
  const suspendSchema = {
    id: Joi.number().required(),
    toSuspend: Joi.bool().required()
  }
  return Joi.validate(request, suspendSchema)
}

module.exports = { credentialsValidation, suspendValidation }
