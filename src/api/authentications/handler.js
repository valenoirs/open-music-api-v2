const autoBind = require('auto-bind')

class AuthenticationsHandler {
  constructor(authenticationsService, validator, tokenManager) {
    this._authenticationsService = authenticationsService
    this._validator = validator
    this._tokenManager = tokenManager

    autoBind(this)
  }

  async postAuthenticationHandler(req, h) {
    this._validator.validatePostAuthenticationPayload(req.payload)

    const { username, password } = req.payload

    const userId = await this._authenticationsService.verifyUserCredential(
      username,
      password
    )

    const accessToken = this._tokenManager.generateAccessToken({ userId })
    const refreshToken = this._tokenManager.generateRefreshToken({ userId })

    await this._authenticationsService.createRefreshToken(refreshToken)

    return h
      .response({
        status: 'success',
        data: {
          accessToken,
          refreshToken,
        },
      })
      .code(201)
  }

  async putAuthenticationHandler(req) {
    this._validator.validatePutAuthenticationPayload(req.payload)

    const { refreshToken } = req.payload

    await this._authenticationsService.verifyRefreshToken(refreshToken)
    const { userId } = this._tokenManager.verifyRefreshToken(refreshToken)

    const accessToken = this._tokenManager.generateAccessToken({ userId })

    return {
      status: 'success',
      data: {
        accessToken,
      },
    }
  }

  async deleteAuthenticationHandler(req) {
    this._validator.validateDeleteAuthenticationPayload(req.payload)

    const { refreshToken } = req.payload

    await this._authenticationsService.verifyRefreshToken(refreshToken)
    await this._authenticationsService.deleteRefreshToken(refreshToken)

    return {
      status: 'success',
      message: 'bye',
    }
  }
}

module.exports = AuthenticationsHandler
