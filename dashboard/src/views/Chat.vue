<template>
  <div class="home">
    <Header />
  </div>
  <div id="app">
    <Chat />
  </div>
</template>

<script>
import Header from "../components/Header.vue";
import Chat from "../components/Chat.vue";
//import config from "../config.js";

export default {
  name: "Chat full",
  components: {
    Header,
    Chat,
  },
};
</script>

<style scoped>
#head {
  margin: 50px 300px 0 300px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#chat {
  position: relative;
}
</style>
