<template>
  <Header />
  <div id="AuthForm">
    <div id="authForm-heading">Login</div>
    <hr
      style="
        border: none;
        border-bottom: 1px solid #bfbfbf;
        width: 80%;
        margin-bottom: 10px;
      "
    />
    <div>
      <form v-on:submit.prevent="login">
        <div v-if="this.error !== null">
          <div class="alert alert-danger">
            {{ this.error }}
          </div>
        </div>
        <input
          type="text"
          placeholder="Username or email"
          maxlength="20"
          autofocus
          v-model="username"
          autocomplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          autocomplete="current-password"
          v-model="password"
        />
        <button class="btn-big btn-blue" @click="login" type="submit">
          Login
        </button>
      </form>
    </div>
    <Oauth2Buttons />
  </div>
</template>

<script>
import Header from "../components/Header.vue";
import Oauth2Buttons from "@/components/Oauth2Buttons";
import config from "../config.js";

import { useToast } from "vue-toastification";
import "../assets/css/toast.min.css";
const toast = useToast();

export default {
  name: "Login",
  components: {
    Header,
    Oauth2Buttons,
  },
  data() {
    return {
      username: "",
      password: "",
      error: null,
      windowObjectReference: null,
    };
  },
  methods: {
    validateFields() {
      if (this.username === "" || this.password === "") {
        this.error = "Please fill in all fields";
        return false;
      }
      return true;
    },
    login() {
      let valid = this.validateFields();
      if (valid) {
        fetch(`${config.api.url}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        })
          .then(async (res) => {
            let data = await res.json();
            if (data.error) {
              data.message
                ? (this.error = data.message)
                : (this.error = data.error);
            } else {
              this.$store.state.user = {
                token: data.token,
                expired: false,
                expIn: data.exp,
              };

              this.$store.commit("setToken");
              //this.$store.commit("setGameID");
              await this.$router.push("/dashboard");
            }
          })
          .catch((err) => {
            this.error = "API error: " + err.message;
          });
      }
    },
  },
  created() {
    if (this.$store.state.user.token && !this.$store.state.user.expired) {
      this.$router.push("/dashboard");
    }
    if (this.$route.query.error) {
      toast.error(this.$route.query.error);
    }
  },
};
</script>

<style>
@import url("../assets/css/authForm.css");
</style>
