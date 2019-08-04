const Joi = require('joi')

const createValidation = request => {
  const createSchema = {
    name: Joi.string().required(),
    authorId: Joi.number().required()
  }
  return Joi.validate(request, createSchema)
}
const editValidation = request => {
  const editSchema = {
    name: Joi.string().required(),
    id: Joi.number().required()
  }
  return Joi.validate(request, editSchema)
}
const viewValidation = request => {
  const viewSchema = {
    name: Joi.string().optional(),
    authorId: Joi.number().optional(),
    assignedTo: Joi.number()
      .allow(null)
      .optional(),
    submittedTask: Joi.string()
      .allow(null)
      .optional(),
    endDate: Joi.date()
      .allow(null)
      .optional(),
    isConfirmed: Joi.bool().optional(),
    isFrozen: Joi.bool().optional(),
    sortId: Joi.bool().optional(),
    sortEndDate: Joi.bool().optional(),
    sortApplicants: Joi.bool().optional()
  }
  return Joi.validate(request, viewSchema)
}

module.exports = {
  createValidation,
  editValidation,
  viewValidation
}
