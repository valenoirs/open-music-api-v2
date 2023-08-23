const { Pool } = require('pg')
const { nanoid } = require('nanoid')

const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool()
    this._collaborationsService = collaborationsService
  }

  async createPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING playlist_id',
      values: [id, name, owner],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].playlist_id) {
      throw new InvariantError('Failed to create playlist')
    }

    return result.rows[0].playlist_id
  }

  async readPlaylists(owner) {
    const query = {
      text: `SELECT playlists.playlist_id AS id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON playlists.owner = users.user_id
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.playlist_id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async deletePlaylistById(playlist_id) {
    const query = {
      text: 'DELETE FROM playlists WHERE playlist_id = $1 RETURNING playlist_id',
      values: [playlist_id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete playlist, playlist not found')
    }
  }

  async createPlaylistSongs(playlist_id, song_id) {
    const id = `playlistSong-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlist_id, song_id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Failed to add song to playlist')
    }

    return result.rows[0].id
  }

  async readPlaylistById(playlist_id) {
    const query = {
      text: `SELECT playlists.playlist_id AS id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON playlists.owner = users.user_id
      WHERE playlists.playlist_id = $1`,
      values: [playlist_id],
    }

    const result = await this._pool.query(query)

    return result.rows[0]
  }

  async readPlaylistSongs(playlist_id) {
    const query = {
      text: `SELECT songs.song_id AS id, songs.title, songs.performer
      FROM songs
      FULL JOIN playlist_songs ON playlist_songs.song_id = songs.song_id
      FULL JOIN playlists ON playlists.playlist_id = playlist_songs.playlist_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlist_id],
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async deletePlaylistSongs(playlist_id, song_id) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlist_id, song_id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError(
        'Failed to delete song from playlist, song not found'
      )
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE playlist_id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError(
        'You are not authorized to access this resource'
      )
    }
  }

  async verifyPlaylistAccess(id, owner) {
    try {
      await this.verifyPlaylistOwner(id, owner)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      try {
        await this._collaborationsService.verifyCollaborator(id, owner)
      } catch {
        throw error
      }
    }
  }
}

module.exports = PlaylistsService
