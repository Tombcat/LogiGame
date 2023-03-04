<template>
  <header>
    <ul class="no-list-style">
      <li><router-link class="btn-primary" to="/">Home</router-link></li>
      <li><router-link class="btn-primary" to="/play">Play</router-link></li>
      <!--<li v-if="!token">
        <router-link class="btn-primary" to="/Login">Login</router-link>
      </li>
      <li v-if="!token">
        <router-link class="btn-primary" to="/Signup">Sign up</router-link>
      </li>
      <li v-if="token !== null">
        <router-link class="btn-primary" to="/Dashboard">Dashboard</router-link>
      </li>
      <li v-if="token !== null">
        <router-link class="btn-primary btn-red" to="/Logout"
          >Logout</router-link
        >
      </li>
      -->
      <li>
        <a href="https://github.com/Tombcat" class="btn-primary btn-blue"
          ><i class="fab fa-github"></i> My GitHub</a
        >
      </li>
    </ul>
  </header>
</template>

<script>
export default {
  name: "Logout",
  data() {
    return {
      token: this.$store.state.user.token,
    };
  },
};
</script>

<style></style>
