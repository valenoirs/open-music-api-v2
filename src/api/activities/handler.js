const autoBind = require('auto-bind')

class ActivitiesHandler {
  constructor(activitiesService, playlistsService) {
    this._activitiesService = activitiesService
    this._playlistsService = playlistsService

    autoBind(this)
  }

  async getActivitiesHandler(req) {
    const { id: playlistId } = req.params
    const { userId: credentialId } = req.auth.credentials

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId)
    const activities = await this._activitiesService.readActivities(playlistId)

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    }
  }
}

module.exports = ActivitiesHandler
