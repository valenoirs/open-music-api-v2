/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    playlist_id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  })

  pgm.addConstraint(
    'playlists',
    'fk_playlists.owner_users.user_id',
    'FOREIGN KEY(owner) REFERENCES users(user_id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropTable('playlists')
}
