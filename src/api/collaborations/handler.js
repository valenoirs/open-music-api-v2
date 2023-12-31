/* eslint-disable operator-linebreak */
const autoBind = require('auto-bind')

class CollaborationsHandler {
  constructor(
    collaborationsService,
    playlistsService,
    usersService,
    validator
  ) {
    this._collaborationsService = collaborationsService
    this._playlistsService = playlistsService
    this._usersService = usersService
    this._validator = validator

    autoBind(this)
  }

  async postCollaborationHandler(req, h) {
    this._validator.validateCollaborationPayload(req.payload)
    const { userId: credentialId } = req.auth.credentials
    const { playlistId, userId } = req.payload

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
    await this._usersService.getUserById(userId)

    const collaborationId =
      await this._collaborationsService.createCollaboration(playlistId, userId)

    return h
      .response({
        status: 'success',
        data: { collaborationId },
      })
      .code(201)
  }

  async deleteCollaborationHandler(req) {
    this._validator.validateCollaborationPayload(req.payload)
    const { userId: credentialId } = req.auth.credentials
    const { playlistId, userId } = req.payload

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)

    await this._collaborationsService.deleteCollaboration(playlistId, userId)

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    }
  }
}

module.exports = CollaborationsHandler
