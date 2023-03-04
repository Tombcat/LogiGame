<template>
  <div id="play" class="d-flex flex-row">
    <PlayHeader />
    <main class="container-fluid pt-4 ps-sm-5">
      <listOfGames
        @joinGame="joinGame"
        @changeMode="changeMode"
        v-if="mode === null || mode === 'Games'"
      />
      <HostGame
        @changeMode="changeMode"
        @joinGame="joinGame"
        v-if="mode === 'Host'"
      />
      <loading
        v-if="
          (mode === 'Play' || mode === 'teamSelect' || mode === 'loading') &&
          (!$store.state.gameProgress ||
            !$store.state.gameSettings ||
            !$store.state.server)
        "
      />

      <Game
        v-if="
          (mode === 'Play' || mode === 'teamSelect') &&
          $store.state.server &&
          $store.state.gameProgress &&
          $store.state.gameSettings
        "
      />
    </main>
  </div>
</template>

<script>
//Import components
import listOfGames from "@/components/listOfGames";
import HostGame from "../components/HostGame";
import Loading from "../components/Loading.vue";
import Game from "../components/Game.vue";
import PlayHeader from "../components/PlayHeader.vue";

// Important libraries
import { useToast } from "vue-toastification";
import socket from "@/socket";

export default {
  name: "Play",
  components: {
    listOfGames,
    HostGame,
    Loading,
    Game,
    PlayHeader,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      mode: "Games",
    };
  },

  created() {
    if (this.$route.query.game) {
      this.joinGame(this.$route.query.game);
    }

    socket.on("disconnect", () => {
      console.debug("Disconected socket connection");
      this.closedSocketConnection();
    });

    socket.on("connect_error", (data) => {
      this.toast.error("Couldn't connect to server");
      window.location.reload();
      console.debug("Connection failed", data);
    });

    socket.on("reconnect_failed", function () {
      console.debug("Reconnection failed");
    });

    socket.on("connect", () => {
      console.debug("Connected to socket successfully");
      this.mode = "loading";
      socket.emit(
        "joinGameServer",
        this.$store.state.player.gameId,
        (response) => {
          console.debug("joinGameServer response: ", response);
          if (!response.success) {
            this.closedSocketConnection();
            this.toast.error(
              `Couldn't join game, reason:\n${response.message}`
            );
            this.mode = "Games";
            socket.close();
            /*this.$store.commit("setPlayerRole", role);
          this.$store.commit("setPlayerTeam", { name, index });*/
          } else {
            this.mode = "teamSelect";
            this.$store.dispatch("setGameSettings");
            this.$store.commit("setServer", response.server);
          }
        }
      );
    });
  },

  unmounted() {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("reconnect_failed");
    socket.off("disconnect");
  },
  methods: {
    joinGame(server) {
      this.$router.replace({ path: "/play", query: { game: server } });
      console.debug("joinGame event: ", server);

      socket.auth = {
        username: this.$store.state.player.username,
      };

      socket.connect();
    },

    closedSocketConnection() {
      this.mode = "Games";
      //this.$store.commit("clearGame");
      this.$store.commit("setServer", null);
    },

    changeMode(mode) {
      this.mode = mode;
    },
  },
};
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  height: 100vh;
  overflow: auto;
  width: 100%;
  background: #f0f0f0;
}
</style>
