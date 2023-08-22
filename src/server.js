require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

const ClientError = require('./exceptions/ClientError')
const TokenManager = require('./tokenize/TokenManager')

// Album
const albumHandler = require('./api/albums')
const AlbumsService = require('./services/AlbumsService')
const AlbumsValidator = require('./validator/albums')

// Songs
const songHandler = require('./api/songs')
const SongsService = require('./services/SongsService')
const SongsValidator = require('./validator/songs')

// Users
const usersHandler = require('./api/users')
const UsersService = require('./services/UsersService')
const UsersValidator = require('./validator/users')

// Authentications
const authenticationsHandler = require('./api/authentications')
const AuthenticationsService = require('./services/AuthenticationsService')
const AuthenticationsValidator = require('./validator/authentications')

// Playlists
const playlistsHandler = require('./api/playlists')
const PlaylistsService = require('./services/PlaylistsService')
const PlaylistsValidator = require('./validator/playlists')

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
      plugin: Jwt,
    },
  ])

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
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
    {
      plugin: usersHandler,
      options: {
        usersService: new UsersService(),
        validator: UsersValidator,
      },
    },
    {
      plugin: playlistsHandler,
      options: {
        playlistsService: new PlaylistsService(),
        songsService: new SongsService(),
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authenticationsHandler,
      options: {
        authenticationsService: new AuthenticationsService(),
        validator: AuthenticationsValidator,
        tokenManager: TokenManager,
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

      console.log(response)

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
