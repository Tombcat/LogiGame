<template>
  <h5>Servers online: {{ listOfGames.length }}</h5>
  <div
    id="controls"
    class="w-100 d-flex flex-md-row flex-column-reverse justify-content-between gap-3"
  >
    <input
      class="searchBar"
      type="text"
      v-model="search"
      name="search"
      id="search"
      placeholder="Search for game..."
    />
    <div class="actions d-flex align-items-center">
      <button class="button" @click="loadListOfGames()">
        Refresh list of games
      </button>
      <button class="button" @click="changeMode('Host')">Host Game</button>
    </div>
  </div>
  <div id="listOfGames" class="w-100 d-flex flex-row flex-wrap gap-3">
    <div
      class="game d-flex flex-column p-3 align-items-start"
      v-for="game in listOfGames"
      :key="game.id"
    >
      <p class="title">{{ game.name }}</p>
      <div class="details mt-2 w-100 d-flex flex-row justify-content-between">
        <div class="">
          <img class="svg" :src="game.one ? player : players" alt="" /><span
            class="px-1 align-middle"
            >{{ game.players }}/{{ maxPlayers(game) }} Players</span
          >
        </div>
        <div>
          <img class="svg" :src="months" alt="" /><span
            class="px-1 align-middle"
            >{{ game.nMonths }} Months</span
          >
        </div>
      </div>
      <p class="gameId w-100 my-1 text-end">Game ID: {{ game.id }}</p>
      <img v-if="game.passworded" :src="lock" alt="" class="svg password" />
      <button class="button" @click="joinGame(game.id)">Join Game</button>
    </div>
  </div>
</template>

<script>
import config from "@/config.js";

export default {
  name: "Play full",
  emits: ["changeMode", "joinGame"],
  components: {},
  data() {
    return {
      player: require("../assets/medias/user-solid.svg"),
      players: require("../assets/medias/users-solid.svg"),
      months: require("../assets/medias/calendar-solid.svg"),
      lock: require("../assets/medias/lock-solid.svg"),
      search: undefined,
      games: [],
      server: null,
    };
  },
  computed: {
    listOfGames: {
      get() {
        if (this.search !== undefined) {
          return this.games.filter(
            (v) =>
              v.name.toLowerCase().includes(this.search.toLowerCase()) ||
              v.id.includes(this.search)
          );
        }

        return this.games;
      },

      set(newValue) {
        this.games = newValue;
      },
    },
  },
  methods: {
    maxPlayers(game) {
      return game.one ? game.teams.length : game.teams.length * 4;
    },
    joinGame(event) {
      this.$emit("joinGame", event);
    },

    changeMode(event) {
      this.$emit("changeMode", event);
    },
    loadListOfGames() {
      fetch(`${config.gameApi.url}/server/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.$store.state.user.token}`,
        },
      })
        .then(async (response) => {
          const data = await response.json();
          this.listOfGames = data.games;
        })
        .catch((error) => {
          console.debug("Couldnt call getGameMonths action");
          console.error(error);
        });
    },
  },
  created() {
    this.loadListOfGames();
  },
};
</script>

<style lang="scss" scoped>
#listOfGames {
  .game {
    width: 300px;
    flex-grow: 1;

    position: relative;

    background: #ffffff;
    box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    p {
      margin: 0;
    }
    .svg {
      width: 25px;
      filter: invert(74%) sepia(31%) saturate(2278%) hue-rotate(328deg)
        brightness(103%) contrast(101%);
    }
    .title {
      height: 50px;
      width: 85%;
      font-weight: bold;
      overflow: hidden;
    }
    .gameId {
      font-size: 0.8rem;
      color: #d1d1d1;
    }
    .password {
      position: absolute;
      right: 20px;
    }
  }
}

#controls {
  .searchBar {
    width: 300px;
    min-width: 300px;

    border: 2px solid #ccc;
    border-radius: 4px;
    background-color: white;
    background-image: url("https://www.w3schools.com/css/searchicon.png");
    background-position: 10px 10px;
    background-repeat: no-repeat;
    padding: 8px 20px 8px 40px;
    transition: 0.4s ease-in-out;
    &:focus {
      flex-grow: 1;
    }
    @include media-breakpoint-down(md) {
      & {
        width: 100%;
      }
    }
  }
}
</style>
