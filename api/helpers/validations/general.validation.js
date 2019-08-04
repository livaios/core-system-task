const Joi = require('joi')

const headerValidation = request => {
  const headerSchema = {
    channel: Joi.string().required(),
    timestamp: Joi.string()
      .isoDate()
      .required(),
    request_id: Joi.string().required()
  }
  return Joi.validate(request, headerSchema)
}
const freezeValidations = request => {
  const freezeSchema = {
    id: Joi.number().required(),
    toFreeze: Joi.bool().required()
  }
  return Joi.validate(request, freezeSchema)
}

module.exports = { headerValidation, freezeValidations }
