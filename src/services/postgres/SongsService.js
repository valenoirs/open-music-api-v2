const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { songsDBToModel, songDBToModel } = require('../../utils/mapper')

class SongsService {
  constructor() {
    this._pool = new Pool()
  }

  async createSong({ title, year, genre, performer, duration, albumId }) {
    const song_id = `song-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING song_id',
      values: [song_id, title, year, genre, performer, duration, albumId],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].song_id) {
      throw new InvariantError('Failed to add new song')
    }

    return result.rows[0].song_id
  }

  async readSongs() {
    const songs = await this._pool.query(
      'SELECT song_id AS id, title, performer FROM songs'
    )
    return songs.rows
  }

  async readSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE song_id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Song with certain not found')
    }

    return result.rows.map(songDBToModel)[0]
  }

  async updateSongById(
    id,
    { title, year, genre, performer, duration, albumId }
  ) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE song_id = $7 RETURNING song_id',
      values: [title, year, genre, performer, duration, albumId, id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Failed to update song, song not found')
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE song_id = $1 RETURNING song_id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete song, song not found')
    }
  }

  async readSongsByAlbumId(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    }

    const songs = await this._pool.query(query)

    return songs.rows.map(songsDBToModel)
  }
}

module.exports = SongsService
