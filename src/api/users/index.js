const UsersHandler = require('./handler')
const usersRoutes = require('./routes')

module.exports = {
  name: 'users',
  version: '1.0.0',
  register: (server, { usersService, validator }) => {
    const usersHandler = new UsersHandler(usersService, validator)

    server.route(usersRoutes(usersHandler))
  },
}
