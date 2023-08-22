const Joi = require('joi')

const PostPlaylistPayloadValidationSchema = Joi.object({
  name: Joi.string().required(),
})

const PostPlaylistSongPayloadValidationSchema = Joi.object({
  songId: Joi.string().required(),
})

const DeletePlaylistSongPayloadValidationSchema = Joi.object({
  songId: Joi.string().required(),
})

module.exports = {
  PostPlaylistPayloadValidationSchema,
  PostPlaylistSongPayloadValidationSchema,
  DeletePlaylistSongPayloadValidationSchema,
}
