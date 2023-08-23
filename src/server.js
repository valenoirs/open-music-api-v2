require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

const ClientError = require('./exceptions/ClientError')
const TokenManager = require('./tokenize/TokenManager')

// Album
const albumHandler = require('./api/albums')
const AlbumsService = require('./services/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')

// Songs
const songHandler = require('./api/songs')
const SongsService = require('./services/postgres/SongsService')
const SongsValidator = require('./validator/songs')

// Users
const usersHandler = require('./api/users')
const UsersService = require('./services/postgres/UsersService')
const UsersValidator = require('./validator/users')

// Authentications
const authenticationsHandler = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const AuthenticationsValidator = require('./validator/authentications')

// Playlists
const playlistsHandler = require('./api/playlists')
const PlaylistsService = require('./services/postgres/PlaylistsService')
const PlaylistsValidator = require('./validator/playlists')

// Activities
const activitiesHandler = require('./api/activities')
const ActivitiesService = require('./services/postgres/ActivitiesService')

// Collaborations
const collaborationsHandler = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const activitiesService = new ActivitiesService()
  const collaborationsService = new CollaborationsService()
  const playlistsService = new PlaylistsService(collaborationsService)

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
        albumsService,
        songsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songHandler,
      options: {
        songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: usersHandler,
      options: {
        usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: activitiesHandler,
      options: {
        activitiesService,
        playlistsService,
      },
    },
    {
      plugin: collaborationsHandler,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: playlistsHandler,
      options: {
        playlistsService,
        songsService,
        activitiesService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authenticationsHandler,
      options: {
        authenticationsService,
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

    .then(() => console.log(`Server running on ${server.info.uri}`)) // eslint-disable-line no-console
}

init()
