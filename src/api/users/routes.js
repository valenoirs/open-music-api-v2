const usersRoutes = ({ postUserHandler }) => [
  {
    method: 'POST',
    path: '/users',
    handler: postUserHandler,
  },
]

module.exports = usersRoutes
