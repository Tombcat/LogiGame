<template>
  <div id="teams">
    <h2 class="text-center">Select your role from list of teams</h2>
    <p class="text-center" v-if="$store.state.player.isHost">
      You can still play if you are host of the game
    </p>
    <div id="listOfTeams" class="d-flex flex-wrap gap-3 mt-4">
      <div class="__single" v-for="(team, index) in server.teams" :key="team">
        <h3 class="title">{{ team.name }}</h3>
        <div id="game-form-radios">
          <p>Choose your role</p>

          <p
            @click="itemClicked(team.name, index, key)"
            v-for="(role, key) in team.players"
            :key="role"
            class="__role"
            :class="[key + '-bg', { '--taken': role }]"
          >
            {{ capitalizeFirstLetter(key) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/socket";

export default {
  name: "Teams",
  computed: {
    server() {
      return this.$store.state.server;
    },
  },
  methods: {
    itemClicked(name, index, role) {
      console.debug("Join team ", { name, index, role });

      socket.emit("joinTeam", { name, index, role }, (response) => {
        console.debug("Joint team socket response: ", response);
        if (response) {
          this.$store.commit("setPlayerRole", role);
          this.$store.commit("setPlayerTeam", { name, index });
        }
      });

      this.$emit("joinTeam", { name, index, role });
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /*joinTeam(event) {


      /*let message = JSON.stringify({
        meta: "init",
        payload: {
          name: this.$store.state.player.name,
          role: event.role,
          team: event.team,
          teamIndex: event.index,
        },
      });

      this.SOCKET_connection.send(message);
    },*/
  },
};
</script>

<style lang="scss" scoped>
#listOfTeams {
  .__single {
    min-width: 200px;
    //max-width: 400px;
    padding: 20px;
    flex-grow: 1;
    background-color: ghostwhite;
    box-shadow: 0px 3px 10px -2px rgba(161, 170, 166, 0.5);
    .__role {
      cursor: pointer;
      height: 100%;
      display: block;
      color: white;
      border-radius: 20px;
      padding: 1rem;
      margin-bottom: 1rem;
      text-align: center;
      box-shadow: 0px 3px 10px -2px rgba(161, 170, 166, 0.5);
      position: relative;
      font-weight: 600;
    }
    .--taken {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}
</style>
