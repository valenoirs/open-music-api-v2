require('dotenv').config()

const Hapi = require('@hapi/hapi')

const ClientError = require('./exceptions/ClientError')

// Album
const albumHandler = require('./api/albums')
const AlbumsService = require('./services/AlbumsService')
const AlbumsValidator = require('./validator/albums')

// Songs
const songHandler = require('./api/songs')
const SongsService = require('./services/SongsService')
const SongsValidator = require('./validator/songs')

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  await server.register([
    {
      plugin: albumHandler,
      options: {
        albumsService: new AlbumsService(),
        songsService: new SongsService(),
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songHandler,
      options: {
        songsService: new SongsService(),
        validator: SongsValidator,
      },
    },
  ])

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: response.message,
          })
          .code(response.statusCode)
      }

      if (!response.isServer) {
        return h.continue
      }

      return h
        .response({
          status: 'error',
          message: 'Something went wrong with our server',
        })
        .code(500)
    }

    return h.continue
  })

  await server
    .start()
    .then(() => console.log(`Server running on ${server.info.uri}`))
}

init()
