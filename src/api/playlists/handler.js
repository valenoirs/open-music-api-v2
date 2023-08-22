const autoBind = require('auto-bind')

class PlaylistsHandler {
  constructor(playlistsService, songsService, activitiesService, validator) {
    this._playlistsService = playlistsService
    this._songsService = songsService
    this._activitiesService = activitiesService
    this._validator = validator

    autoBind(this)
  }

  async postPlaylistHandler(req, h) {
    this._validator.validatePostPlaylistPayload(req.payload)

    const { name } = req.payload
    const { userId: credentialId } = req.auth.credentials

    const playlistId = await this._playlistsService.createPlaylist(
      name,
      credentialId
    )

    return h
      .response({
        status: 'success',
        data: {
          playlistId,
        },
      })
      .code(201)
  }

  async getPlaylistsHandler(req) {
    const { userId: credentialId } = req.auth.credentials

    const playlists = await this._playlistsService.readPlaylists(credentialId)

    return {
      status: 'success',
      data: {
        playlists,
      },
    }
  }

  async deletePlaylistByIdHandler(req) {
    const { id: playlist_id } = req.params
    const { userId: credentialId } = req.auth.credentials

    await this._playlistsService.verifyPlaylistOwner(playlist_id, credentialId)
    await this._playlistsService.deletePlaylistById(playlist_id)

    return { status: 'success', message: 'Playlist deleted' }
  }

  async postPlaylistSongHandler(req, h) {
    this._validator.validatePostPlaylistSongPayload(req.payload)

    const { id: playlist_id } = req.params
    const { songId } = req.payload
    const { userId: credentialId } = req.auth.credentials

    await this._songsService.readSongById(songId)

    await this._playlistsService.verifyPlaylistAccess(playlist_id, credentialId)
    await this._playlistsService.createPlaylistSongs(playlist_id, songId)

    await this._activitiesService.createActivities(
      playlist_id,
      songId,
      credentialId,
      'add'
    )

    return h
      .response({
        status: 'success',
        message: 'Song added to playlist',
      })
      .code(201)
  }

  async getPlaylistSongsHandler(req) {
    const { id: playlist_id } = req.params
    const { userId: credentialId } = req.auth.credentials

    await this._playlistsService.verifyPlaylistAccess(playlist_id, credentialId)
    const playlist = await this._playlistsService.readPlaylistById(playlist_id)
    const songs = await this._playlistsService.readPlaylistSongs(playlist_id)

    return {
      status: 'success',
      data: {
        playlist: { ...playlist, songs },
      },
    }
  }

  async deletePlaylistSongHandler(req) {
    this._validator.validateDeletePlaylistSongPayload(req.payload)

    const { id: playlist_id } = req.params
    const { songId } = req.payload
    const { userId: credentialId } = req.auth.credentials

    await this._songsService.readSongById(songId)

    await this._playlistsService.verifyPlaylistAccess(playlist_id, credentialId)
    await this._playlistsService.deletePlaylistSongs(playlist_id, songId)

    await this._activitiesService.createActivities(
      playlist_id,
      songId,
      credentialId,
      'delete'
    )

    return {
      status: 'success',
      message: 'Song deleted from playlist',
    }
  }
}

module.exports = PlaylistsHandler
