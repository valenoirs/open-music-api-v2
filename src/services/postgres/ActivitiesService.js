const { Pool } = require('pg')
const { nanoid } = require('nanoid')

const InvariantError = require('../../exceptions/InvariantError')

class ActivitiesService {
  constructor() {
    this._pool = new Pool()
  }

  async createActivities(playlist_id, song_id, user_id, action) {
    const id = `activities-${nanoid(16)}`

    const time = new Date().toISOString()

    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING activities_id',
      values: [id, playlist_id, song_id, user_id, action, time],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Failed to save activities')
    }
  }

  async readActivities(playlist_id) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_activities.action, playlist_activities.time
      FROM playlist_activities
      JOIN users ON users.user_id = playlist_activities.user_id
      JOIN songs ON songs.song_id = playlist_activities.song_id
      WHERE playlist_activities.playlist_id = $1`,
      values: [playlist_id],
    }

    const result = await this._pool.query(query)

    return result.rows
  }
}

module.exports = ActivitiesService
