<template>
  <div id="host">
    <div class="server">
      <div class="title">
        <h2>Host Game</h2>
        <button class="button" @click="changeMode('Games')">Back</button>
      </div>

      <label>
        Enter server name:
        <input type="text" v-model="server.name" maxlength="60"
      /></label>
      <label>
        Enter server password: <input type="text" v-model="server.pass"
      /></label>
      <label> Game ID: <input type="text" v-model="gameId" /></label>
      <button
        class="button"
        :class="{ disabled: !gameId || !server.name }"
        @click="hostGame"
      >
        Host Game
      </button>
      <button
        class="button"
        :class="{ disabled: !gameId }"
        @click="loadGameSettings"
      >
        Load game
      </button>
    </div>
    <div id="settings">
      <div class="__general">
        <h3>General settings</h3>
        <label
          >Game name
          <input
            type="text"
            style="max-width: 100%"
            v-model="settings.game.name"
        /></label>
        <label
          >Initial budget
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.game.InitialBudget"
        /></label>
        <label
          >Inventory affect sales
          <input type="checkbox" v-model="settings.game.InventoryAffectSales"
        /></label>
      </div>
      <div class="__carbon">
        <h3>Carbon policy</h3>
        <label
          >Policy Option
          <select v-model="settings.game.carbon_policy.option">
            <option value="1">First</option>
            <option value="2">Second</option>
            <option value="3">Third</option>
          </select>
        </label>
        <label
          >Carbon Tax
          <input
            type="number"
            step="1"
            min="0"
            v-model="settings.game.carbon_policy.Carbon_Tax"
        /></label>
        <label
          >Carbon Cap
          <input
            type="number"
            step="1"
            min="0"
            v-model="settings.game.carbon_policy.Carbon_Cap"
        /></label>
        <label
          >Penalty
          <input
            type="number"
            step="1"
            min="0"
            v-model="settings.game.carbon_policy.Penalty"
        /></label>
      </div>
      <div class="__investment" v-if="true == false">
        <h3>Investment options</h3>
        <label
          >IV_UProd_Em
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.game.investment_options.IV_UProd_Em"
        /></label>
        <label
          >A_P
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.game.investment_options.A_P"
        /></label>
        <label
          >IV_UHoldWP_Em
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.game.investment_options.IV_UHoldWP_Em"
        /></label>
        <label
          >A_IWP
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.game.investment_options.A_IWP"
        /></label>
        <label
          >IV_UHoldWR_Em
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.game.investment_options.IV_UHoldWR_Em"
        /></label>
        <label
          >A_IWR
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.game.investment_options.A_IWR"
        /></label>
      </div>
      <div class="__production">
        <h3>Production</h3>
        <label
          >Monthly Max Production Capacity
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.production.Prod_Cap"
        /></label>
        <label
          >Production leadtime in months
          <input
            type="number"
            step="0.1"
            min="0"
            v-model="settings.production.LeadProd"
        /></label>
        <label
          >Variability penalty in (%)
          <input
            type="number"
            step="1"
            max="100"
            min="0"
            v-model="settings.production.VarProd"
        /></label>
        <label
          >Per unit production cost
          <input
            type="number"
            step="0.1"
            min="0"
            v-model="settings.production.UProd_Cost"
        /></label>
        <label
          >Per unit production emission
          <input
            type="number"
            step="0.1"
            min="0"
            v-model="settings.production.UProd_Em"
        /></label>
        <label
          >Inventory level to start with
          <input
            type="number"
            step="10"
            min="0"
            v-model="settings.production.InvtWPB_0"
        /></label>
        <label
          >Retail Inventory level to start with
          <input
            type="number"
            step="10"
            min="0"
            v-model="settings.production.InvtWRB_0"
        /></label>
        <label
          >Production Warehouse Storage Capacity
          <input
            type="number"
            step="100"
            min="0"
            v-model="settings.production.WP_Cap"
        /></label>
        <label
          >Per unit month holding cost at production
          <input
            type="number"
            step="0.1"
            min="0"
            v-model="settings.production.UHoldWP_Cost"
        /></label>
        <label
          >Per unit month emission production warehouse
          <input
            type="number"
            step="0.1"
            min="0"
            v-model="settings.production.UHoldWP_Em"
        /></label>
      </div>
      <div class="__distribution">
        <h3>Distribution</h3>
        <div>
          <label
            >Per unit emission of moving one item by air
            <input
              type="number"
              step="0.1"
              min="0"
              v-model="settings.distribution.UAir_Em"
          /></label>
          <label
            >Per unit Emission of moving one container
            <input
              type="number"
              step="0.1"
              min="0"
              v-model="settings.distribution.Cont_Em"
          /></label>
          <label
            >Capacity of container
            <input
              type="number"
              step="10"
              v-model="settings.distribution.Cont_Cap"
          /></label>
          <label
            >Cost of moving one container by sea
            <input
              type="number"
              step="10"
              min="0"
              v-model="settings.distribution.Cont_Cost"
          /></label>
          <label
            >Per unit cost of moving one item by air
            <input
              type="number"
              step="0.1"
              min="0"
              v-model="settings.distribution.UAir_Cost"
          /></label>
        </div>
      </div>
      <div class="__sales">
        <h3>Sales</h3>
        <div class="months">
          <label
            >Number of months:
            <input type="number" name="" id="" v-model="monthsCount"
          /></label>
          <table class="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Index</th>
                <th>Name</th>
                <th>Label</th>
                <th>Demand</th>
                <th>Demand History</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="month in settings.months" :key="month.id">
                <td>{{ month.index }}</td>
                <td>
                  <input type="text" placeholder="Name" v-model="month.name" />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Label"
                    v-model="month.label"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    placeholder="Demand"
                    v-model="month.demand"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    placeholder="Demand history"
                    v-model="month.demandHistory"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import config from "@/config.js";
import { useToast } from "vue-toastification";

export default {
  name: "Host Game",
  emits: ["changeMode", "joinGame"],
  components: {},
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      server: {
        name: "test",
        pass: null,
      },
      settings: {
        game: {
          InventoryAffectSales: false,
          carbon_policy: {
            option: 1,
            Carbon_Tax: 1,
            Carbon_Cap: 10,
            Penalty: 2,
          },
          InitialBudget: 10000,
          name: "test1-miled-n",
          investment_options: {
            IV_UProd_Em: 1,
            A_P: 2,
            IV_UHoldWP_Em: 5,
            A_IWP: 4,
            IV_UHoldWR_Em: 3,
            A_IWR: 6,
          },
        },
        distribution: {
          UAir_Cost: 2.9,
          Cont_Cost: 1000,
          Cont_Cap: 500,
          UAir_Em: 1.45,
          Cont_Em: 0.9,
        },
        sales: {
          WR_Cap: 4550,
          UHoldWR_Cost: 1.65,
          UHoldWR_Em: 1.25,
          DeltaPrice: 2,
          InitialPrice: 90,
          MarketType: "independent",
          DemandType: "stochastic",
          PED: 0,
        },
        production: {
          Prod_Cap: 5400,
          LeadProd: 1,
          VarProd: 0,
          UProd_Cost: 1.5,
          UProd_Em: 1.3,
          InvtWPB_0: 2400,
          InvtWRB_0: 720,
          WP_Cap: 5600,
          UHoldWP_Cost: 1.2,
          UHoldWP_Em: 1.3,
        },
        advertisements: [
          {
            option: 0,
            Yield_Impact: 0,
            Budget: 0,
            Comment: "No Advertisment",
          },
          {
            option: 1,
            Yield_Impact: 1,
            Budget: 10000,
            Comment: "1%",
          },
          {
            option: 2,
            Yield_Impact: 2,
            Budget: 20000,
            Comment: "2%",
          },
        ],
        months: [
          {
            index: "1",
            name: "January",
            label: "January",
            demand: 1300,
            demandHistory: 1100,
          },
          {
            index: "2",
            name: "February",
            label: "February",
            demand: "1200",
            demandHistory: "1300",
          },
          {
            index: "3",
            name: "March",
            label: "March",
            demand: "1000",
            demandHistory: "800",
          },
          {
            index: "4",
            name: "April",
            label: "April",
            demand: "700",
            demandHistory: "700",
          },
          {
            index: "5",
            name: "May",
            label: "May",
            demand: "840",
            demandHistory: "800",
          },
          {
            index: "6",
            name: "June",
            label: "June",
            demand: "1000",
            demandHistory: "1000",
          },
          {
            index: "7",
            name: "July",
            label: "July",
            demand: "1500",
            demandHistory: "1500",
          },
          {
            index: "8",
            name: "August",
            label: "August",
            demand: "1100",
            demandHistory: "1100",
          },
          {
            index: "9",
            name: "September",
            label: "September",
            demand: "900",
            demandHistory: "900",
          },
          {
            index: "10",
            name: "October",
            label: "October",
            demand: "600",
            demandHistory: "600",
          },
          {
            index: "11",
            name: "November",
            label: "November",
            demand: "800",
            demandHistory: "800",
          },
          {
            index: "12",
            name: "December",
            label: "December",
            demand: "1200",
            demandHistory: "1200",
          },
        ],
      },
    };
  },
  computed: {
    // a computed getter
    monthsCount: {
      // `this` points to the component instance
      get() {
        return this.settings.months.length;
      },

      set(newValue) {
        let index = this.settings.months.length;
        if (newValue > index) {
          index++;
          this.settings.months.push({
            index: index,
          });
        } else {
          this.settings.months.length = newValue;
        }
      },
    },
    gameId: {
      get() {
        return this.$store.state.player.gameId;
      },
      set(newValue) {
        this.$store.commit("setPlayerGameId", newValue);
      },
    },
  },

  methods: {
    consoleMonths() {
      console.debug(this.months);
    },
    changeMode(event) {
      this.$emit("changeMode", event);
    },
    loadGameSettings() {
      fetch(
        `${config.gameApi.url}/game/${this.$store.state.player.gameId}/months`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          const data = await response.json();
          this.settings = data.data;
        })
        .catch((error) => {
          console.debug("Couldnt call getGameMonths action");
          console.error(error);
        });
    },
    joinGame(event) {
      this.$store.commit("setPlayerHost");
      this.$emit("joinGame", event);
    },
    hostGame() {
      fetch(`${config.gameApi.url}/server/host`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.$store.state.user.token}`,
        },
        body: JSON.stringify({
          gameId: this.gameId,
          name: this.server.name,
          password: this.server.pass,
        }),
      })
        .then(async (res) => {
          let data = await res.json();
          console.debug("Game host response", data);
          if (res.status === 201) {
            this.joinGame(data.game.id);
            this.toast.success("Game Hosted");
          } else if (res.status === 400) {
            this.toast.error(data.payload);
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
#settings {
  width: 100%;
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  label {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    margin-bottom: 10px;
  }
  input {
    border: none;
    max-width: 120px;
    border-bottom: 1px solid #000;
    background-color: transparent;
    &:focus {
      border: none;
      background-color: rgb(199, 199, 199);
    }
  }
}

#host {
  width: 100%;
}

.server {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  color: $primary-color;
}
</style>
