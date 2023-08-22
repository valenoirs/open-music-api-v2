const ClientError = require('./ClientError')

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message)

    this.statusCode = 401
    this.name = 'AuthenticationError'
  }
}

module.exports = AuthenticationError
