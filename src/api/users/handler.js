const autoBind = require('auto-bind')

class UsersHandler {
  constructor(usersService, validator) {
    this._usersService = usersService
    this._validator = validator

    autoBind(this)
  }

  async postUserHandler(req, h) {
    this._validator.validateUserPayload(req.payload)

    const userId = await this._usersService.createNewUser(req.payload)

    return h
      .response({
        status: 'success',
        data: { userId },
      })
      .code(201)
  }
}

module.exports = UsersHandler
