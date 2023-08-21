const SongsHandler = require('./handler')
const songsRoutes = require('./routes')

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { songsService, validator }) => {
    const songHandler = new SongsHandler(songsService, validator)

    server.route(songsRoutes(songHandler))
  },
}
