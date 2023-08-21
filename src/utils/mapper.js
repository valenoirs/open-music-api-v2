exports.albumDBToModel = ({ album_id, name, year }) => {
  return { id: album_id, name, year }
}

exports.songsDBToModel = ({ song_id, title, performer }) => {
  return {
    id: song_id,
    title,
    performer,
  }
}

exports.songDBToModel = ({
  song_id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => {
  return {
    id: song_id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
  }
}
