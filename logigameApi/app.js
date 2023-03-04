//'use strict'

const path = require('path')
const AutoLoad = require('@fastify/autoload')
const Swagger = require('@fastify/swagger')
const apiAddress = process.env.API_ADDRESS || 'localhost'
const protocol = process.env.PROTOCOL || 'http'

const io = require('socket.io');

const PORT = process.env.PORT || 3000

module.exports = function (fastify, opts, next) {
  // Place here your custom code!  

  fastify.register(Swagger, {
    routePrefix: '/swagger',
    exposeRoute: true,
    swagger: {
      info: {
        title: 'Test swagger Edugame',
        description: 'Testing edugame api, you need to create a game, then a team, then set periods',
        version: '0.1.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: apiAddress+":"+PORT,
      schemes: [protocol],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [{
          name: 'game',
          description: 'Game related end-points'
        },
        {
          name: 'production',
          description: 'Production related end-points'
        },
        {
          name: 'distribution',
          description: 'Distribution related end-points'
        },
        {
          name: 'sales',
          description: 'Sales related end-points'
        }
      ],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      }
    }
  })


  fastify.register(require('@fastify/cors'),{
    origin: '*'
  })

  fastify.register(require('fastify-socket.io'), { 
    socketIO: io,
    cors: {
      origin: '*',
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in services
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'services'),
    options: Object.assign({}, opts)
  })

  fastify.ready(err => {
    console.log('successfully booted!')
    //console.log(`server listening on ${apiAddress}`)
    if (err) {
      fastify.log.error(err)
      throw err
    }

    console.log(`server listening ${fastify.server.address()}`)

    fastify.swagger()
  })

  /*fastify.listen(PORT, '0.0.0.0')
  .then((address) => console.log(`server listening on ${address}`))
  .catch(err => {
    console.log('Error starting server:', err)
    process.exit(1)
  })*/

  // Make sure to call next when done
  next()
}
