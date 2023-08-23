const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const AuthenticationError = require('../../exceptions/AuthenticationError')
const InvariantError = require('../../exceptions/InvariantError')

class AuthenticationsService {
  constructor() {
    this._pool = new Pool()
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT user_id, password FROM users WHERE username = $1',
      values: [username],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthenticationError('Invalid user credential')
    }

    const { user_id, password: hashedPassword } = result.rows[0]

    const match = await bcrypt.compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Invalid user credential')
    }

    return user_id
  }

  async createRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    }

    await this._pool.query(query)
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    }

    await this._pool.query(query)
  }
}

module.exports = AuthenticationsService
