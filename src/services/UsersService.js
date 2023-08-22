const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')

const InvariantError = require('../exceptions/InvariantError')

class UsersService {
  constructor() {
    this._pool = new Pool()
  }

  async createNewUser({ username, password, fullname }) {
    await this.verifyNewUsername(username)

    const id = `user-${nanoid(16)}`

    const hashedPassword = await bcrypt.hash(password, 12)

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING user_id',
      values: [id, username, hashedPassword, fullname],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].user_id) {
      throw new InvariantError('Failed to create new user')
    }

    return result.rows[0].user_id
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    }

    const result = await this._pool.query(query)

    if (result.rowCount) {
      throw new InvariantError(
        'Failed to create new user, username already existed'
      )
    }
  }
}

module.exports = UsersService
