const { AlbumPayloadValidationSchema } = require('./schema')

const InvariantError = require('../../exceptions/InvariantError')

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const result = AlbumPayloadValidationSchema.validate(payload)

    if (result.error) {
      throw new InvariantError(result.error.message)
    }
  },
}

module.exports = AlbumsValidator
