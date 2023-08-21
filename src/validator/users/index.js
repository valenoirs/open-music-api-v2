const { UserPayloadValidationSchema } = require('./schema')

const InvariantError = require('../../exceptions/InvariantError')

const UsersValidator = {
  validateUserPayload: (payload) => {
    const result = UserPayloadValidationSchema.validate(payload)

    if (result.error) {
      throw new InvariantError(result.error.message)
    }
  },
}

module.exports = UsersValidator
