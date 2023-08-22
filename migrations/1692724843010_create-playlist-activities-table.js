/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlist_activities', {
    activities_id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    time: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  })

  pgm.addConstraint(
    'playlist_activities',
    'fk_playlist_activities.playlist_id_playlists.playlist_id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(playlist_id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropTable('playlist_activities')
}
