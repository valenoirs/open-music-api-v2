const activitiesRoutes = ({ getActivitiesHandler }) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: getActivitiesHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
]

module.exports = activitiesRoutes
