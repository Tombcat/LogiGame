# LogiGame Vue & Node app

[Github](https://github.com/Tombcat/LogiGame)

##### Game created for students to learn logistics by fun. Using VueJS, Swagger, Socket.Io and Fastify.

The idea of the game is to earn most money, by specifying amounts of goods to be produced, transported and sold on the market.
Players have to be careful because market need is limited and can be shared between playing teams.
Addition to that almost every action produces CO2 polution, which is not good for the enviorment.

### Game roles:

- **Production** - Specify how much goods to produce
- **Distrubution** - Specify how much goods to transport by plane or ship, between production and store warehouses
- **Sales** - Set price for goods and choose advertisment budget
- **Manager** - Keep an eye on the team and invest in CO2 polution reduction

### How to Play?

Live Version: https://logi-game-dashboard.netlify.app/
If you approach any problems with the game just refresh the page, should fix most of it.

**⚠️ If there is no more players on the server, it will close.**

Head to Play tab, click on Host Game and again on the Host Game to start with the default settings. (This part is still not finished, cannot create new game)

Now you can join a team from list of three "Lions", "Tigers" or "Rookies", by selecting role which you want to cover. (You can open the page in incognito mode to simulate other players). For each role you will find input field.

As a game host (player which created server or was the first to join when main host left) can start a game by hovering or clicking on the "**HOST**" tab in the top of the page, right under game info clock.

### ⚠️ ️ ️What is missing

- Preview of finished game results (VUE & Node)
- Full game creation, can only use demo Game ID: 63c30d49fe0afeaf68e789c5 (VUE)
- Hidden game ID, shouldn't be related to game server ID (VUE & Node)
- independant or shared market display, also player shouldn't see future months (VUE)
- Play as every role at once (VUE)
- List of players in the game, and ability for Host to kick them (VUE & Node)
- Manager CO2 polutiion reduction (VUE)
- Login and Register (VUE & NODE)
- Player name selection (VUE)
- Not every data chart is avalible for the player at this moment (VUE)
- Some bugs in the display and data workflow problems between VUE and Node

Project still under development (unfortulatelly I don't have much time to do it), don't mind me any errors or ugly code :)

## VUE

Under /dashboard folder you will find all files.
Based on https://github.com/dev-cetus vue project, used as a starting point while learning vue (not avalible anymore).

## Game server

Under /logigameApi folder you will find Fastify, Swagger & Socket.io App

Main game engine in fastify was started by someone I don't personally know ;/
I continued his work, made a lot of changes, but there might be still problems with correcet calculations for the game.

Firstly i started by creating my own websocket communication, but that was hell of a ride. That's why I have added Socket.io support to manage live gameplay with Vue

## 👥 Contributors:

- [Tombcat](https://github.com/Tombcat)
- [Tekos past employee](https://tekos.co/)
