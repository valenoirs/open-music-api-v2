const AuthenticationsHandler = require('./handler')
const authenticationsRoutes = require('./routes')

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: (server, { authenticationsService, validator, tokenManager }) => {
    const authencationsHandler = new AuthenticationsHandler(
      authenticationsService,
      validator,
      tokenManager
    )

    server.route(authenticationsRoutes(authencationsHandler))
  },
}
