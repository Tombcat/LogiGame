<template>
  <div
    id="clock"
    class="vw-100 d-flex justify-content-center"
    v-if="gameProgress"
  >
    <HostView v-if="this.$store.state.player.isHost" />
    <div
      class="content d-flex flex-row justify-content-around align-items-center"
      :class="stages[gameProgress.currentStage] + '-bg'"
    >
      <p>
        <img
          class="svg-white icon"
          :src="img.status[gameProgress.status]"
          alt=""
        />
      </p>
      <p>
        <img class="svg-white icon" :src="img.clock" alt="" />
        <span>{{ countDown }} / {{ gameProgress.interval }} seconds</span>
      </p>
      <p>
        <img class="svg-white icon" :src="img.calendar" alt="" />
        <span>{{ months[gameProgress.currentMonth].name }}</span>
      </p>
    </div>
  </div>
</template>

<script>
import HostView from "@/components/HostView";
import socket from "@/socket";

import { useToast } from "vue-toastification";

export default {
  name: "Clock",
  components: {
    HostView,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      stages: ["production", "distribution", "sales", "manager"],
      timer: null,
      countDown: 0,
      img: {
        clock: require("../assets/medias/clock/clock-regular.svg"),
        calendar: require("../assets/medias/clock/calendar-regular.svg"),
        status: {
          running: require("../assets/medias/clock/play-solid.svg"),
          stopped: require("../assets/medias/clock/stop-solid.svg"),
          paused: require("../assets/medias/clock/pause-solid.svg"),
        },
      },
    };
  },
  watch: {
    "$store.state.gameProgress": "gameProgressUpdate",
  },

  computed: {
    gameProgress() {
      return this.$store.state.gameProgress;
    },
    months() {
      return this.$store.state.gameSettings.months;
    },
  },

  methods: {
    timerStartStop() {
      clearTimeout(this.timer);
      this.countDown = this.$store.getters.floorRemainingTime;
      if (this.$store.state.gameProgress.status == "running") {
        this.countDownTimer();
      }
    },

    gameProgressUpdate() {
      console.debug("clock stage Changed");
      this.timerStartStop();
    },

    countDownTimer() {
      if (this.countDown > 0) {
        this.timer = setTimeout(() => {
          this.countDown--;
          this.countDownTimer();
        }, 1000);
      }
    },
  },

  mounted() {
    if (this.$store.state.gameProgress) {
      this.timerStartStop();
    }
  },

  created() {
    socket.on("gameStatusChanged", (event) => {
      this.$store.commit("setGameProgress", event);
    });

    socket.on("setGameHost", () => {
      console.debug("setGameHost");
      this.$store.commit("setPlayerHost");
      this.toast("You are now host of the game");
    });
  },

  unmounted() {
    console.debug("unmounted clock");
    clearTimeout(this.timer);
    socket.off("setGameHost");
    socket.on("gameStatusChanged");
  },
};
</script>

<style lang="scss">
#clock {
  position: fixed;
  z-index: 20;
  top: 0;
  left: 20px;

  @include media-breakpoint-down(sm) {
    & {
      left: 0;
    }
  }

  .content {
    //min-width: 320px;
    width: 50rem;
    padding: 8px 20px;
    max-width: 100%;
    z-index: 10;

    height: 2rem;

    gap: 5px;

    border-radius: 0 0 2rem 2rem;
    color: #fff;
    font-weight: 600;

    @include media-breakpoint-down(md) {
      & {
        width: 85%;
      }
    }

    @include media-breakpoint-down(sm) {
      & {
        width: 100%;
      }
    }

    .icon {
      width: 20px;
      vertical-align: middle;
      margin-bottom: 2px;
    }
    p {
      margin: 0;
      span {
        margin-left: 8px;
      }
    }
  }
}
</style>
