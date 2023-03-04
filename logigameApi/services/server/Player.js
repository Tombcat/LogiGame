'use strict'

/*myEmitter.on('test', (res) => {
    console.log('worked!');
});*/

const emitter = require('../../lib/emitter').emitter

module.exports = class Player{

    gameId = null

    _client = null

    //#connection = null

    name = null
    role = null
    team = null

    _messageListener = null;

    _gameListener = null

    constructor(name, role, team, client) {
        this.name = name,
        this.role = role,
        this.team = team,
        this._client = client
    }

    init(details){
        //this.name = details.name,
        // this.team = details.team,
        //this.role = details.role

        if(this.name !== null && this.team !== null && this.role){
            this._messageListener = (event, done) => {
                if (
                event.gameId == this.gameId && event.team == this.team &&
                (event.broadCast || event.name == this.name)
                ) {
                    this._client.connection.socket.send(
                    JSON.stringify({ meta: event.meta, payload: event.payload })
                );
                }
    
                done();
            };

            this._gameListener = (event, done) => {
                if (
                event.gameId == this.gameId
                ) {
                    this._client.connection.socket.send(
                    JSON.stringify({ meta: event.meta, gameId: event.gameId})
                );
                }
    
                done();
            };

        }else{
            console.debug('Missing player details on init');
            return;  
        }  

        this._client.connection.socket.send(
            JSON.stringify({ meta: "joining-success", payload:{
              name: this.name,
              gameId: this.gameId,
              role: this.role,
              team: this.team,
            }}))

        emitter.on("room-event", this._messageListener);
        

        emitter.emit({
            topic: "room-event",
            meta: "room-joined",
            gameId: this.gameId,
            team: this.team,
            broadCast: true,
            payload: {
              name: this.name,
              gameId: this.gameId,
              role: this.role,
              timestamp: new Date().toUTCString(),
            },
          });
    }

    sendMessage(payload){
        emitter.emit({
            topic: "room-event",
            meta: "send-message",
            gameId: this.gameId,
            team: this.team,
            broadCast: true,
            payload: {
              name: this.name,
              role: this.role,
              text: payload,
              timestamp: new Date().toUTCString(),
            },
          });
    }

    leftChat(){
        if(this._gameListener !== null){
            emitter.emit({
                topic: "room-event",
                meta: "leave-room",
                gameId: this.gameId,
                team: this.team,
                broadCast: true,
                payload: {
                  role: this.role,
                  name: this.name,
                  timestamp: new Date(),
                },
              });
    
            emitter.removeListener("room-event", this._messageListener);
        } 
    }


    get messageListener(){
        return this._messageListener
    }

    get gameId() {
        return this.gameId;
    }
    
    get name() {
        return this.name;
    }

    get role(){
        return this.role
    }

    get team(){
        return this.team
    }

    get info(){
         return {
            name: thisname,
            gameId: this.gameId,
            role: this.role,
            team: this.team,

        }
    }


}