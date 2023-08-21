const autoBind = require('auto-bind')

class AlbumsHandler {
  constructor(albumsService, songsService, validator) {
    this._albumsService = albumsService
    this._songsService = songsService
    this._validator = validator

    autoBind(this)
  }

  async postAlbumHandler(req, h) {
    const { payload } = req

    this._validator.validateAlbumPayload(payload)

    const albumId = await this._albumsService.createAlbum(payload)

    return h
      .response({
        status: 'success',
        data: { albumId },
      })
      .code(201)
  }

  async getAlbumByIdHandler(req, h) {
    const { id } = req.params

    const album = await this._albumsService.readAlbumById(id)
    const songs = await this._songsService.readSongsByAlbumId(id)

    return h.response({
      status: 'success',
      data: { album: { ...album, songs } },
    })
  }

  async putAlbumByIdHandler(req, h) {
    const { payload, params } = req

    this._validator.validateAlbumPayload(payload)

    const { id } = params

    await this._albumsService.updateAlbumById(id, payload)

    return h.response({
      status: 'success',
      message: 'Album updated',
    })
  }

  async deleteAlbumByIdHandler(req, h) {
    const { id } = req.params

    await this._albumsService.deleteAlbumById(id)

    return h.response({ status: 'success', message: 'Album deleted' })
  }
}

module.exports = AlbumsHandler
