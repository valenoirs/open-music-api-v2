const ActivitiesHandler = require('./handler')
const activitiesRoutes = require('./routes')

module.exports = {
  name: 'activities',
  version: '1.0.0',
  register: (server, { activitiesService, playlistsService }) => {
    const activitiesHandler = new ActivitiesHandler(
      activitiesService,
      playlistsService
    )

    server.route(activitiesRoutes(activitiesHandler))
  },
}
