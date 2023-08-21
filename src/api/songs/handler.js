const autoBind = require('auto-bind')

class SongsHandler {
  constructor(songsService, validator) {
    this._songsService = songsService
    this._validator = validator

    autoBind(this)
  }

  async postSongHandler(req, h) {
    const { payload } = req

    this._validator.validateSongPayload(payload)

    const songId = await this._songsService.createSong(payload)

    return h
      .response({
        status: 'success',
        data: { songId },
      })
      .code(201)
  }

  async getSongsHandler(req, h) {
    const { title, performer } = req.query

    let songs = await this._songsService.readSongs({ title, performer })

    if (title) {
      songs = songs.filter((song) =>
        song.title.toLowerCase().includes(title.toLowerCase())
      )
    }
    if (performer) {
      songs = songs.filter((song) =>
        song.performer.toLowerCase().includes(performer.toLowerCase())
      )
    }

    return h.response({ status: 'success', data: { songs } })
  }

  async getSongByIdHandler(req, h) {
    const { id } = req.params

    const song = await this._songsService.readSongById(id)

    return h.response({ status: 'success', data: { song } })
  }

  async putSongByIdHandler(req, h) {
    const { params, payload } = req

    this._validator.validateSongPayload(payload)

    const { id } = params

    await this._songsService.updateSongById(id, payload)

    return h.response({ status: 'success', message: 'Song updated' })
  }

  async deleteSongByIdHandler(req, h) {
    const { id } = req.params

    await this._songsService.deleteSongById(id)

    return h.response({ status: 'success', message: 'Song deleted' })
  }
}

module.exports = SongsHandler
