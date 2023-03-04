<template>
  <div class="home">
    <Header />
  </div>
  <div id="app">hi</div>
</template>

<script>
import Header from "../components/Header.vue";

//import config from "../config.js";

export default {
  name: "Chat full",
  components: {
    Header,
  },

  data() {
    return {
      message: "",
    };
  },

  mounted() {},
};
</script>

<style scoped></style>
