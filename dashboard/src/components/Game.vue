<template>
  <div class="w-100 my-5">
    <Chat ref="chat" v-if="this.$store.state.player.team" />
    <Teams v-if="!this.$store.state.player.team" />
    <Clock />
    <div id="_panel" v-if="this.$store.state.player.team">
      <Manager v-if="this.$store.state.player.role == 'manager'" />
      <Production v-if="this.$store.state.player.role == 'production'" />
      <Distribution v-if="this.$store.state.player.role == 'distribution'" />
      <Sales v-if="this.$store.state.player.role == 'sales'" />
    </div>
  </div>
</template>

<script>
import Teams from "./Teams.vue";
import Chat from "./Chat.vue";
import {
  Manager,
  Production,
  Distribution,
  Sales,
} from "@/components/game/roles";
import Clock from "@/components/Clock";

import socket from "@/socket";

export default {
  name: "Game",
  components: {
    Teams,
    Chat,
    Clock,
    Manager,
    Production,
    Distribution,
    Sales,
  },
  created() {
    socket.on("serverUpdated", (server) => {
      console.debug("server updated", server);
      this.$store.commit("setServer", server);
    });
  },
};
</script>
