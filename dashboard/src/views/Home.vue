<template>
  <div class="home">
    <Header />
    <div id="head">
      <h1 id="logigame-vue-node-app">LogiGame Vue &amp; Node app</h1>
      <p><a href="https://github.com/Tombcat/LogiGame">Github</a></p>
      <h5
        id="game-created-for-students-to-learn-logistics-by-fun-using-vuejs-swagger-socket-io-and-fastify-"
      >
        Game created for students to learn logistics by fun. Using VueJS,
        Swagger, Socket.Io and Fastify.
      </h5>
      <p>
        The idea of the game is to earn most money, by specifying amounts of
        goods to be produced, transported and sold on the market. Players have
        to be careful because market need is limited and can be shared between
        playing teams. Addition to that almost every action produces CO2
        polution, which is not good for the enviorment.
      </p>
      <h3 id="game-roles-">Game roles:</h3>
      <ul>
        <li><strong>Production</strong> - Specify how much goods to produce</li>
        <li>
          <strong>Distrubution</strong> - Specify how much goods to transport by
          plane or ship, between production and store warehouses
        </li>
        <li>
          <strong>Sales</strong> - Set price for goods and choose advertisment
          budget
        </li>
        <li>
          <strong>Manager</strong> - Keep an eye on the team and invest in CO2
          polution reduction
        </li>
      </ul>
      <h3 id="how-to-play-">How to Play?</h3>
      <p>
        Live Version:
        <a href="https://logi-game-dashboard.netlify.app/"
          >https://logi-game-dashboard.netlify.app/</a
        >
        If you approach any problems with the game just refresh the page, should
        fix most of it.
      </p>
      <p>
        <strong
          >⚠️ If there is no more players on the server, it will close.</strong
        >
      </p>
      <p>
        Head to Play tab, click on Host Game and again on the Host Game to start
        with the default settings. (This part is still not finished, cannot
        create new game)
      </p>
      <p>
        Now you can join a team from list of three &quot;Lions&quot;,
        &quot;Tigers&quot; or &quot;Rookies&quot;, by selecting role which you
        want to cover. (You can open the page in incognito mode to simulate
        other players). For each role you will find input field.
      </p>
      <p>
        As a game host (player which created server or was the first to join
        when main host left) can start a game by hovering or clicking on the
        &quot;<strong>HOST</strong>&quot; tab in the top of the page, right
        under game info clock.
      </p>
      <h3 id="-what-is-missing">⚠️ ️ ️What is missing</h3>
      <ul>
        <li>Preview of finished game results (VUE &amp; Node)</li>
        <li>
          Full game creation, can only use demo Game ID:
          63c30d49fe0afeaf68e789c5 (VUE)
        </li>
        <li>
          Hidden game ID, shouldn&#39;t be related to game server ID (VUE &amp;
          Node)
        </li>
        <li>
          independant or shared market display, also player shouldn&#39;t see
          future months (VUE)
        </li>
        <li>Play as every role at once (VUE)</li>
        <li>
          List of players in the game, and ability for Host to kick them (VUE
          &amp; Node)
        </li>
        <li>Manager CO2 polutiion reduction (VUE)</li>
        <li>Login and Register (VUE &amp; NODE)</li>
        <li>Player name selection (VUE)</li>
        <li>
          Not every data chart is avalible for the player at this moment (VUE)
        </li>
        <li>
          Some bugs in the display and data workflow problems between VUE and
          Node
        </li>
      </ul>
      <p>
        Project still under development (unfortulatelly I don&#39;t have much
        time to do it), don&#39;t mind me any errors or ugly code :)
      </p>
      <h2 id="vue">VUE</h2>
      <p>
        Under /dashboard folder you will find all files. Based on
        <a href="https://github.com/dev-cetus">https://github.com/dev-cetus</a>
        vue project, used as a starting point while learning vue (not avalible
        anymore).
      </p>
      <h2 id="game-server">Game server</h2>
      <p>
        Under /logigameApi folder you will find Fastify, Swagger &amp; Socket.io
        App
      </p>
      <p>
        Main game engine in fastify was started by someone I don&#39;t
        personally know ;/ I continued his work, made a lot of changes, but
        there might be still problems with correcet calculations for the game.
      </p>
      <p>
        Firstly i started by creating my own websocket communication, but that
        was hell of a ride. That&#39;s why I have added Socket.io support to
        manage live gameplay with Vue
      </p>
      <h2 id="-contributors-">👥 Contributors:</h2>
      <ul>
        <li><a href="https://github.com/Tombcat">Tombcat</a></li>
        <li><a href="https://tekos.co/">Tekos past employee</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
import Header from "../components/Header.vue";

export default {
  name: "Home",
  components: {
    Header,
  },
  /*created: async function () {
    if (this.$route.query.token) {

      this.$store.state.user = {
        token: this.$route.query.token,
        expired: false,
        expIn: this.$route.query.exp
      }

      this.$store.commit('setToken')
      await this.$router.push('/dashboard')
    }
  }*/
};
</script>

<style scoped>
#head {
  margin: 20px;
}
</style>
