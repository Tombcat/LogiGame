'use strict'

const emitter = require('../../lib/emitter').emitter

const Model = require('../../models/init')

let listOfGames = []

class Game {

    id = null
    //#gameAdmin = null
    #pass = null
    #months = null
    #messages = []
    #connectedClients = []

    one = false
    players = 0
    active = false

    constructor(id, name, pass) {
        this.id = id
        this.name = name
        this.#pass = pass
        this.passworded = (pass)?true:false
        listOfGames.push(this)
    }

    addClient(socket){
        if(this.#connectedClients.length == 0){
            socket.host = true
        }

        this.#connectedClients.push(socket)
    }

    removeClient(socket){
        const index = this.#connectedClients.indexOf(socket);
        this.#connectedClients.splice(index, 1);

        if(this.#connectedClients.length == 0){
            console.debug("There is no more clients, closing server")
            const index = listOfGames.indexOf(this);
            listOfGames.splice(index, 1);
        }else if(socket.host){
            this.#connectedClients[0].host = true
            this.#connectedClients[0].emit('setGameHost')
        }
    }

    async fetchTeams() {
        let teams = await Model.teams.find({
            game: this.id
        })

        teams.forEach(team=>{

            Object.keys(team.players).forEach(key => {
                team.players[key] = null;
              });
            /*for (let [key, value] of Object.entries(team.players)) {
                value = null
            }*/
        })


        this.teams = teams
        this.#months = await Model.periods.find({game: this.id}).sort('index')
        this.nMonths = this.#months.length
        this.active = true
        return true
    }

    setPlayerTeam(socket) {

        if(this.teams[socket.teamIndex].players[socket.role] !== null){
            return false
        }
        
        this.teams[socket.teamIndex].players[socket.role] = socket.username
        this.players++

        this.serverUpdated(socket)


        return true
    }

    removePlayerTeam(socket) {
        if(socket.team){
            this.teams[socket.teamIndex].players[socket.role] = null
            this.players--

            this.serverUpdated(socket)
        }
    }

    addMessageToStorage(payload, teamIndex){
        if(!this.#messages[teamIndex]){
            this.#messages[teamIndex] = [payload]
        }else{
            this.#messages[teamIndex].push(payload)
        }
    }


    serverUpdated(socket){
        socket.to(this.id).emit('serverUpdated', this)
    }

    getMessagesForTeam(teamIndex){
        return this.#messages[teamIndex];
    }

    get id() {
        return this.id;
    }


}


module.exports = {
    Game,
    listOfGames
}