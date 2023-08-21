const Joi = require('joi')

exports.UserPayloadValidationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
})
