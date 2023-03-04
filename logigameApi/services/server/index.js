'use strict'

const emitter = require('../../lib/emitter').emitter
const {
    Game,
    listOfGames
} = require('./Game')
const Client = require('./Client')
const Player = require('./Player')

// websocket

module.exports = function (fastify, opts, next) {

    fastify.post('/host',
        {
        schema: {
            description: 'Host a game live server',
            tags: ['server'],
            summary: 'Host a game server',    
            body: {
                type: 'object',
                properties: {
                    gameId: {type: 'string'}
                }
            },
            response: {
            200: {
                description: 'Successful response',
                type: 'object',
                properties: {
                    sucess: {type: 'boolean'}
                }
            }
            }
        }
        }
        , 
        async function (req, res) {
            console.debug("List of games", listOfGames) 
            
            const gameId = req.body.gameId

            if(listOfGames.find(e => e.id === gameId)){
                res.code(400)
                res.send({sucess: false, payload: "Game with that ID is already hosted."})
            }else{
                const game = new Game(gameId, req.body.name, req.body.password)

                await game.fetchTeams()

                console.debug("Game hosted")
                console.debug("List of games", listOfGames)

                res.code(201)
                res.send({sucess: true, payload: "Game have been hosted.", game})
            }
    })


    fastify.get('/list',
        {
        schema: {
            description: 'Return list of live servers',
            tags: ['server'],
            summary: 'Return list of active servers',  
            params: {
            type: 'object',
            properties: {
                id: {
                type: 'string',
                description: 'Game id'
                }
            }
            },   
            response: {
            // 200: {
            //   description: 'Successful response',
            //   type: 'object',
            //   properties: {
            //     team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
            //     sucess: {type: 'boolean'}
            //   }
            // }
            }
        }
        }
        , 
        async function (req, res) {
            const games = listOfGames.filter(game => game.active == true);
        res.send({sucess: true, games})
    })

    fastify.get('/list/:id',
        {
        schema: {
            description: 'Return details of live server',
            tags: ['server'],
            summary: 'Return details of live server',  
            params: {
            type: 'object',
            properties: {
                id: {
                type: 'string',
                description: 'Game id'
                }
            }
            },   
            response: {
            // 200: {
            //   description: 'Successful response',
            //   type: 'object',
            //   properties: {
            //     team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
            //     sucess: {type: 'boolean'}
            //   }
            // }
            }
        }
        }
        , 
        async function (req, res) {
            const gameId = req.params.id;
            const game = listOfGames.find(e => e.id === gameId)

            let response = {
                success: false,
                game: "Not found",
            }

            if (game) {
                 response = {
                    success: true,
                    game: game
                }
            }
            
        res.send(response)
    })

    fastify.get('/chatMessages/:id/:teamIndex',
        {
        schema: {
            description: 'Return messages for a team in the specified game',
            tags: ['server'],
            summary: 'Return messages for a team in the specified game',  
            params: {
            type: 'object',
            properties: {
                id: {
                type: 'string',
                description: 'Game id'
                },
                teamIndex: {
                    type: 'number',
                    description: 'Team index for game server'
                    }
            }
            },   
            response: {
             /*200: {
               description: 'Successful response',
               type: 'object',
               properties: {
                 team: { type: 'array', properties: {name: {type: 'string'}, description: {type: 'string'}} },
                 sucess: {type: 'boolean'}
               }
             }*/
            }
        }
        }
        , 
        async function (req, res) {
            const gameId = req.params.id;
            const game = listOfGames.find(e => e.id === gameId)

            let response = {
                success: false,
                message: "Game not found",
            }

            if (game) {
                const messages = await game.getMessagesForTeam(req.params.teamIndex)
                response = {
                    success: true,
                    messages
                }
            }
            
        res.send(response)
    })

    fastify.io.use((socket, next) => {
        //USERNAME CHECKER
        const username = socket.handshake.auth.username;
        console.debug(`New socket connection request, username: ${username}`)
        if (!username) {
          return next(new Error("invalid username"));
        };

        socket.username = username;

        next();
      });

    function chatAction(socket, action){
        socket.to(`${socket.game}:${socket.teamIndex}`).emit('chatAction', {
            player: {
                username: socket.username,
                role: socket.role,
                team: socket.team
            },
            action
        })
    }
    
    emitter.on("gameStatusChanged", (event, done)=>{
        console.debug("Game status changed", event)
        fastify.io.to(event.gameId).emit(event.topic, event.payload)
        done();
    });

    fastify.io.on('connection', (socket) => {
        console.debug('user connected');
        

        socket.on('chatMessage', (text) => {
            console.debug('chat message', text)
            const message = {
                username: socket.username,
                role: socket.role,
                timestamp: new Date().toUTCString(),
                text: text
            }

            socket.game.addMessageToStorage(message, socket.teamIndex)
            socket.to(`${socket.game}:${socket.teamIndex}`).emit("chatMessage", message);
        })

        socket.on('joinTeam', async (team, callback) => {
            console.debug('join team', team)
            socket.team = team.name;
            socket.role = team.role
            socket.teamIndex = team.index

            const response = await socket.game.setPlayerTeam(socket)

            socket.join(`${socket.game}:${socket.teamIndex}`)

            chatAction(socket, 'join')

            if(response){
                callback({
                    success: true,
                    message: "Successfully joined team",
                    team: team,
                });
            }else{
                callback({success: false, message: "Slot already taken"})
            }
        })

        socket.on('joinGameServer', async (gameId, callback) => {
            //Check if connection have game ID provided
            console.debug(`Game join reqquest, gameId: ${gameId}`)

            if(!gameId) {
                callback({success: false, message:"Game ID not provided"})
                return
            };

            //Assign client to game server
            const game = listOfGames.find(e => e.id === gameId)

            if(!game) {
                callback({success: false, message:"Game not found"})
                return
            };
                
            if (game.players == (game.one? game.teams.length : game.teams.length*4)) {
                callback({success: false, message:"Game server is full"})
                return
            }

            socket.game = game
            socket.gameId = gameId;

            game.addClient(socket)

            socket.join(gameId)

            callback({success: true, message:"Joined successfully", server: game})
        })

        socket.on('disconnect', () => {
            if (socket.game){
                socket.game.removePlayerTeam(socket)
                socket.game.removeClient(socket)

                chatAction(socket, 'leave')
            }

            console.debug('user disconnected');
        });
    });

    
    //Old version of websocket connection, deprecated in favor of socket.io
    /*fastify.register(require('@fastify/websocket'), {
        errorHandler: function (error, conn, req, reply ) {
            // Do stuff
            // destroy/close connection
            console.log("Websocket error handler", error)
            conn.destroy(error)
        },
        options: {
            maxPayload: 1048576, // we set the maximum allowed messages size to 1 MiB (1024 bytes * 1024 bytes)
            verifyClient: function (info, next) {
                if (info.req.headers['sec-websocket-protocol'] !== 'protocol') {
                    return next(false) // the connection is not allowed
                }
                next(true) // the connection is allowed
            }
        }
    })*/


    /*fastify.register(async (fastify) => {
        fastify.get("/", {
            websocket: true
        }, (connection, req) => {
            if (req.query.gameId === undefined) {
                connection.socket.close(1003, "Query parameter doesn't contain gameId")
            }
        
            const game = listOfGames.find(e => e.id === req.query.gameId)
            
            if (game.players == (game.one? game.teams.length : game.teams.length*4)) {
                connection.socket.close(3001, "Game server is full")
            }

            const client = new Client(req.query.gameId, req.query.name, connection, game)

            game.clientsUpdated()

            //console.log("Client gameID: ", client.gameId)

            connection.socket.on("message", (message) => {
                console.debug("received message", JSON.parse(message));
                const {
                    meta,
                    //playerDetails,
                    payload
                } = JSON.parse(message);

                console.log("Message req: ", req.query)
                switch (meta) {
                    case 'init':
                        client.playerInit(payload)
                        //client.setPlayer(new Player(playerDetails.name, playerDetails.role, playerDetails.team, client))
                        break
                    case "join":
                        console.log("Player object: ", player)
                        console.debug("Join case")
                        player.joined()

                        console.debug("PlayerEmmiter How?", player.messageListener)
                        break;

                    case "send-message":
                        console.log("Send message case")
                        // Use the emitter to broadcast the message to the room names
                        client.playerSendMessage(payload)
                        break;

                    default:
                        console.log("default case!")
                        break;
                }
            });
            connection.socket.on("close", (code) => {
                //console.log("removing message listener", player.messageListener);
                console.log("Disconnection code: ", code);
                console.log("REQ query: ", req.query)

                game.clientsUpdated()
                client.closedConnection()
            });
        });
    });*/


    next()
}