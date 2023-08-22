const PlaylistsHandler = require('./handler')
const playlistsRoutes = require('./routes')

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: (
    server,
    { playlistsService, songsService, activitiesService, validator }
  ) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      songsService,
      activitiesService,
      validator
    )

    server.route(playlistsRoutes(playlistsHandler))
  },
}
