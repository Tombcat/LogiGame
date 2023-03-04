<template>
  <div id="hostView" class="d-flex flex-column align-items-center">
    <div class="__content w-100 p-3 row">
      <h4>You are server host</h4>
      <p class="cursor-pointer" @click="copyToClipboard(server.id)">
        Game ID: {{ server.id }}
      </p>

      <div v-if="!true">
        <p>Number of clients: {{ clients }}</p>
        <p>Clients {{ clients }}</p>
        <div class="clients">
          <div
            class="__single"
            v-for="(client, index) in clients"
            :key="client"
          >
            <p class="title">{{ index }}. {{ client.name }}</p>
            <p>{{ client.player.team }}</p>
            <span>{{ client.isHost }}</span>
          </div>
        </div>
      </div>

      <div id="timeControls" v-if="gameProgress">
        <div class="d-flex flex-column flex-sm-row gap-2">
          <button
            class="button ms-0 bg-success"
            @click="timeControl('start')"
            v-show="
              gameProgress.status != 'running' &&
              gameProgress.status != 'paused'
            "
          >
            Start
          </button>
          <button
            class="button ms-0 bg-danger"
            @click="timeControl('stop')"
            v-show="gameProgress.status != 'stopped'"
          >
            Stop
          </button>
          <button
            class="button ms-0 bg-warning"
            @click="timeControl('pause')"
            v-show="gameProgress.status == 'running'"
          >
            Pause
          </button>
          <button
            class="button ms-0 bg-success"
            @click="timeControl('resume')"
            v-show="gameProgress.status == 'paused'"
          >
            Resume
          </button>
          <div
            class="mt-2"
            v-show="
              gameProgress.status == 'stopped' || gameProgress.status == 'ended'
            "
          >
            Stage interval:
            <input
              style="max-width: 100%"
              type="number"
              name=""
              id=""
              v-model="timeInterval"
            />
          </div>
        </div>

        <div
          class="mt-2 restart flex-column gap-2"
          v-show="
            gameProgress.status == 'stopped' || gameProgress.status == 'ended'
          "
        >
          <b>Restart game at any step</b>
          <div class="row">
            <label class="col">
              Stage:
              <select v-model="stage">
                <option value="1">Production</option>
                <option value="2">Distribution</option>
                <option value="3">Sales</option>
                <option value="4">Manager</option>
              </select>
            </label>

            <label class="col">
              Month:
              <select v-model="month">
                <option
                  v-for="month in this.$store.state.gameSettings.months"
                  :key="month.id"
                  v-bind:value="month.index"
                >
                  {{ month.name }}
                </option>
              </select>
            </label>
          </div>

          <button class="button" @click="timeControl('restart')">
            Restart
          </button>
        </div>
      </div>
    </div>
    <div class="__button text-center user-select-none cursor-pointe">
      <p class="m-0 p-1">HOST</p>
    </div>
  </div>
</template>

<script>
import config from "@/config.js";
import { useToast } from "vue-toastification";

export default {
  name: "Host View",
  setup() {
    const toast = useToast();
    return { toast };
  },
  props: {
    clients: {
      required: false,
    },
  },
  data() {
    return {
      timeInterval: 60,
      month: 1,
      stage: 1,
      img: {
        kickPlayer: require("../assets/medias/user-xmark-solid.svg"),
      },
    };
  },
  computed: {
    SOCKET_connection: {
      get() {
        return this.$store.state.SOCKET_connection;
      },
      set(newValue) {
        this.$store.commit("setSocketConnection", newValue);
      },
    },
    server() {
      return this.$store.state.server;
    },
    gameProgress() {
      return this.$store.state.gameProgress;
    },
  },

  created() {
    console.debug("Host view component created");
  },

  methods: {
    copyToClipboard(text) {
      // Copy the text inside the text field
      navigator.clipboard.writeText(text);
    },

    timeControl(action) {
      let body = null;
      if (action == "start") {
        body = {
          interval: this.timeInterval,
        };
      } else if (action == "restart") {
        body = {
          month: this.month,
          stage: this.stage,
          interval: this.timeInterval,
        };
      }

      console.debug("body", body);

      fetch(
        `${config.gameApi.url}/game/${this.$store.state.server.id}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
          body: JSON.stringify(body),
        }
      )
        .then(async (res) => {
          let data = await res.json();
          console.debug("Game status:", res);
          if (res.status === 200) {
            this.toast("Game: " + action);
          } else if (res.status === 400) {
            this.toast.error(data.message);
          } else {
            this.toast.error("Something went wrong");
          }
        })
        .catch((err) => {
          console.error(err.toString());
          this.toast.error(err.toString());
        });
    },
  },
};
</script>

<style lang="scss" scoped>
#hostView {
  position: absolute;
  width: 40rem;

  min-height: 40px;
  top: -1000%;

  color: #fff;
  max-width: 85vw;

  transition: 0.5s;
  .__button {
    position: fixed;
    top: 2rem;
    border-radius: 0 0 2rem 2rem;
    width: 10rem;
    background-color: rgba($primary-color, 0.8);
    transition: 0.5s;
    transition-property: opacity;
  }
  .__content {
    border-radius: 0 0 2rem 2rem;
    background-color: $primary-color;
  }

  &:hover {
    top: 2rem;

    .__button {
      opacity: 0;
    }
  }
}

#timeControls {
  .restart {
    display: flex;
  }
}

.teams {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  flex-direction: row;
  .__single {
    min-width: 200px;
    padding: 20px;
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
