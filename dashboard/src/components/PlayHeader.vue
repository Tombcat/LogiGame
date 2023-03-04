<template>
  <header>
    <div class="__button">
      <p class="title">
        <span>↑↑</span>
        Show Menu
        <span>↑↑</span>
      </p>
    </div>
    <div class="header__content d-flex flex-column p-3 justify-content-between">
      <div class="d-flex flex-column gap-2 mt-2">
        <h2>LogiGame</h2>
        <ul
          class="header__list list-style-none d-flex flex-column gap-3 m-0 p-0"
        >
          <li><router-link to="/">Home</router-link></li>
          <li v-if="this.$store.state.server" @click="leaveGame()">
            <router-link to="/play">Leave Game</router-link>
          </li>
        </ul>
      </div>
      <div class="d-flex flex-column gap-2">
        <p>Name: {{ this.$store.state.player.username }}</p>
        <!--<ul
          class="header__list list-style-none d-flex flex-column gap-3 m-0 p-0"
        >
          <li v-if="!token"><router-link to="/Login">Login</router-link></li>
          <li v-if="!token">
            <router-link to="/Signup">Sign up</router-link>
          </li>
          <li v-if="token !== null">
            <router-link to="/Dashboard">Dashboard</router-link>
          </li>
          <li v-if="token !== null">
            <router-link to="/Logout">Logout</router-link>
          </li>
        </ul>
        -->
      </div>
    </div>
  </header>
</template>

<script>
import socket from "@/socket";
export default {
  name: "Play Header",
  computed: {
    token() {
      return this.$store.state.user.token;
    },
  },
  methods: {
    leaveGame() {
      socket.disconnect();
    },
  },
};
</script>

<style lang="scss" scoped>
/************* HEADER *************/

header {
  /* Sidebar */
  z-index: 100;
  color: #fff;
  position: fixed;
  left: -20rem;

  width: 20rem;
  height: 100vh;
  background: #355e6b;
  transition: 0.5s;

  @include media-breakpoint-down(sm) {
    & {
      //display: none;
      width: 100vw;
      height: 80%;
      left: 0;
      bottom: -80%;

      overflow-y: scroll;
    }
  }

  &:hover {
    left: 0;
    -webkit-box-shadow: 1px 0px 12px 3px rgba(66, 68, 90, 1);
    -moz-box-shadow: 1px 0px 12px 3px rgba(66, 68, 90, 1);
    box-shadow: 1px 0px 12px 3px rgba(66, 68, 90, 1);

    @include media-breakpoint-down(sm) {
      & {
        bottom: 0;
        .__button {
          bottom: 80vh;
        }
      }
    }

    .__button {
      opacity: 0;
    }
  }
  .__button {
    width: 2rem;
    position: absolute;
    left: 20rem;
    top: 0;

    background-color: rgba($primary-color, 0.8);
    height: 100%;
    transition: 0.5s;

    @include media-breakpoint-down(sm) {
      & {
        //display: none;
        z-index: 200;
        position: fixed;
        width: 100%;
        //height: 8vh;\
        height: 2rem;
        left: 0;
        bottom: 0;
        top: auto;
      }
    }

    .title {
      width: 100vh;

      position: absolute;
      left: 2rem;
      padding: 0 20px;

      display: flex;
      flex-direction: row;
      justify-content: space-between;

      font-size: 1.2rem;

      /* Border is the new background */
      background: none;

      /* Rotate from top left corner (not default) */
      transform-origin: 0 0;
      transform: rotate(90deg);

      @include media-breakpoint-down(sm) {
        & {
          width: 100%;
          left: 0;
          top: 0;
          transform: rotate(0);
        }
      }
    }
  }
  .header__content {
    height: 100%;
    .header__list {
      height: 100%;
      li {
        background: #ffffff;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 15px;
        margin: 0;

        font-weight: 600;
        line-height: 19px;
        padding: 0.7rem;

        a {
          text-align: center;
          text-decoration: none;
          display: inline-block;
          width: 100%;
        }
      }
    }
  }
}
</style>
