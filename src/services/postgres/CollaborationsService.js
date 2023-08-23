const { Pool } = require('pg')
const { nanoid } = require('nanoid')

const InvariantError = require('../../exceptions/InvariantError')

class CollaborationsService {
  constructor() {
    this._pool = new Pool()
  }

  async createCollaboration(playlist_id, user_id) {
    const id = `collab-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING collaboration_id',
      values: [id, playlist_id, user_id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan')
    }

    return result.rows[0].collaboration_id
  }

  async deleteCollaboration(playlist_id, user_id) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING collaboration_id',
      values: [playlist_id, user_id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus')
    }
  }

  async verifyCollaborator(playlist_id, user_id) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlist_id, user_id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi')
    }
  }
}

module.exports = CollaborationsService
