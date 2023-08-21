const Joi = require('joi')

const currentYear = new Date().getFullYear()

exports.AlbumPayloadValidationSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required().min(1800).max(currentYear),
})
