import { createStore } from 'vuex'
import Cookie from 'vue-cookies'
import config from "@/config.js";

var user = { id:1, name:'Journal',session:'25j_7Sl6xDq2Kc3ym0fmrSSk2xV2XkUkX' };

export default createStore({
    state: {
        user: {
            token: document.cookie.split('; ').find(row => row.startsWith('token=')) ? document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1] : null,
            expired: !document.cookie.split('; ').find(row => row.startsWith('token=')),
            expIn: null,
        },
        game: {
            id: document.cookie.split('; ').find(row => row.startsWith('id=')) ? document.cookie.split('; ').find(row => row.startsWith('id=')).split('=')[1] : null,
            team: document.cookie.split('; ').find(row => row.startsWith('team=')) ? document.cookie.split('; ').find(row => row.startsWith('team=')).split('=')[1] : null,
        },
        lang: localStorage.getItem('lang') || navigator.language || 'en',
        player:{
            gameId: '63c30d49fe0afeaf68e789c5',
            username:  "Martin " + Date.now(),
            role: null,
            team: null,
            isHost: false,
        },
        server: null,
        gameProgress: null,
        gameSettings: null,
    },
    mutations: {
        setToken(state) {
            document.cookie = `token=${state.user.token}; expires=${new Date(parseInt(state.user.expIn)*1000).toUTCString()}; path=/`
        },
        setGameID(state) {
            document.cookie = `id=${state.game.id}; path=/`
            document.cookie = `team=${state.game.team}; path=/`
        },
        deleteToken(state) {
            state.user.token = null;
            state.user.expired = null;
            
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        },
        setPlayerGameId(state, newValue){
            state.player.gameId = newValue
        },
        setPlayerName(state, newValue){
            console.debug("setplayer name")
            state.player.name = newValue
        },
        setPlayerRole(state, newValue){
            state.player.role = newValue
        },
        setPlayerTeam(state, newValue){
            state.player.team = newValue
        },
        setPlayerHost(state){
            state.player.isHost = true
        },
        setGameProgress(state, status){
            state.gameProgress = status
        },
        setGameSettings(state, data){
            state.gameSettings = data
        },
        setServer(state, newValue){
            state.server = newValue
        },
        clearGame(state){
            state.gameProgress = null,
            state.gameSettings = null
        },
    },
    actions: {
        setTestCookie(){
            Cookie.set('user',user);
        },
        setSocketConnection({commit}, connection){
            commit('setSocketConnection', connection)
        },
        setWebsocketConnectionInfo({commit},connection){
            commit('setWebsocketConnectionInfo', connection)
        },
        setGameProgress({commit, state}){
            fetch(`${config.gameApi.url}/game/${state.player.gameId}/status`, {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${state.user.token}`
                }
              })
                .then(async response => {
                  const data = await response.json();
                  //console.debug("updateGameStatus data actions: ",data)
                  commit('setGameProgress',data)
      
                })
              .catch(error => {
                console.debug("Error while running updateGameStatus")
                console.debug(error);
              });
        },
        setGameSettings({commit, state, dispatch}){
            fetch(`${config.gameApi.url}/game/${state.player.gameId}/months`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${state.user.token}`
              }
            })
              .then(async response => {
                const data = await response.json();
                console.debug("Updage game settings data actions: ",data.data)
                commit('setGameSettings', data.data)
                dispatch('setGameProgress')
              })
            .catch(error => {
              console.debug("Couldnt call getGameMonths action")
              console.error(error);
            });
    
          }
    },
    getters: {
        getTestCookie(){
            return Cookie.get('user')
        },
        floorRemainingTime(state){
            const remaining = Math.round((state.gameProgress?.timeEndAt - Date.now())/1000)
            return remaining || 0
        }
    }
})
