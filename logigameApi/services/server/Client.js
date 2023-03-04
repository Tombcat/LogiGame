'use strict'

const emitter = require('../../lib/emitter').emitter
const {
    Game,
    //listOfGames
} = require('./Game.js')

/******************************* Whole functionality depriciated!!! **************************************** */
/*
module.exports = class Client {

    #connection = null
    #gameListener = null
    #messageListener = null
    #game = null
    #hostListener = null

    name = ''
    isHost = false
    gameId = null
    player = null


    constructor(gameId, name, connection, game) {
        this.gameId = gameId,
        this.#connection = connection,
        this.#game = game,
        this.name = name,
        this.setGameListener()
        game.addClient(this)
        emitter.on("game-event", this.#gameListener);
    }

    playerInit(details){
        this.player = {
            name: details.name,
            role: details.role,
            team: details.team,
            teamIndex: details.teamIndex
        }

        if(!this.#game.setPlayerTeam(this)) {
            console.log("Set player team, failed")
            this.player = null
            return
        }

        console.log("Set player team, success")

        if(this.player.name !== null && this.player.team !== null && this.player.role){
            this.#messageListener = (event, done) => {
                console.debug("Message listener activated", event)

                if (event.gameId == this.gameId && 
                    event.teamIndex == this.player.teamIndex &&
                (event.broadCast || event.name == this.name)
                ) {
                    console.debug("Message listener activated")
                    this.#connection.socket.send(
                    JSON.stringify({ meta: event.meta, payload: event.payload })
                );
                }
    
                done();
            };
        }else{
            console.debug('Missing player details on init');
            return;  
        }  

        this.#connection.socket.send(
            JSON.stringify({ 
                meta: "joining-success", 
                payload:{
                    gameId: this.gameId,
                    name: this.player.name,
                    role: this.player.role,
                    team: this.player.team,
                },
                messages: this.#game.getMessagesForTeam(this.player.teamIndex)
        }))

        emitter.on("room-event", this.#messageListener);

        emitter.emit({
            topic: "room-event",
            meta: "room-joined",
            gameId: this.gameId,
            teamIndex: this.player.teamIndex,
            broadCast: true,
            payload: {
              name: this.player.name,
              gameId: this.gameId,
              role: this.player.role,
              timestamp: new Date().toUTCString(),
            },
          });        
    }

    playerSendMessage(message){
        console.debug("Client | Player send message: ", message)

        const payload = {
            name: this.player.name,
            role: this.player.role,
            text: message,
            timestamp: new Date().toUTCString(),
        }

        this.#game.addMessageToStorage(payload, this.player.teamIndex)

        emitter.emit({
            topic: "room-event",
            meta: "send-message",
            gameId: this.gameId,
            teamIndex: this.player.teamIndex,
            broadCast: true,
            payload
          });
    }

    playerLeftChat(){
        if(this.player){
            emitter.emit({
                topic: "room-event",
                meta: "leave-room",
                gameId: this.gameId,
                teamIndex: this.player.teamIndex,
                broadCast: true,
                    payload: {
                        role: this.player.role,
                        name: this.player.name,
                        timestamp: new Date(),
                    },
                });
            emitter.removeListener("room-event", this.#messageListener);
        }
    }

    setAsHost(){
        this.isHost = true

        emitter.on("host-event", this.#gameListener);

        this.#connection.socket.send(
            JSON.stringify({ 
                meta: "setAsHost",
        }))
    }

    setGameListener() {
        this.#gameListener = (event, done) => {
            if (event.gameId === this.gameId) {
                this.#connection.socket.send(
                    JSON.stringify({
                        meta: event.meta,
                        gameId: event.gameId,
                        game: event.game,
                        payload: event.payload
                    })
                );
            }
            done();
        };
    }

    closedConnection() {
        //Occurs when connection with websocket is closed

        this.playerLeftChat()
        this.#game.removePlayerTeam(this)
        this.#game.removeClient(this)
       // this.#game.removePlayerTeam(this._player, this)
        //this.#player.leftChat()
    }

    destroyConnection(code, reason) {
        //Used to close connection with websocket

        this.#connection.close(code, reason)
    }

    get gameId() {
        return this.gameId
    }

    get connection() {
        return this._connection
    }
}*/