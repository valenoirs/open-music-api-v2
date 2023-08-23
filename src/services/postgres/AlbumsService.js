const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { albumDBToModel } = require('../../utils/mapper')

class AlbumsService {
  constructor() {
    this._pool = new Pool()
  }

  async createAlbum({ name, year }) {
    const album_id = `album-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO albums VALUES($1 ,$2, $3) RETURNING album_id',
      values: [album_id, name, year],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].album_id) {
      throw new InvariantError('Failed to add new album')
    }

    return result.rows[0].album_id
  }

  async readAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE album_id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album with certain id not found')
    }

    return result.rows.map(albumDBToModel)[0]
  }

  async updateAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE album_id = $3 RETURNING album_id',
      values: [name, year, id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Failed to update album, album not found')
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE album_id = $1 RETURNING album_id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete album, album not found')
    }
  }
}

module.exports = AlbumsService
