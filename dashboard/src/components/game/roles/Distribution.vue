<template>
  <div id="production" class="d-flex flex-column gap-4">
    <div class="row">
      <div class="col-12 col-md-6">
        <h3>
          Hello {{ this.$store.state.player.username }}, you are responsible for
          <span class="distribution">Distribution.</span>
        </h3>
        <ul class="list-group">
          <li class="list-group-item">
            Your goal is to define in each month how much goods should be
            produced.
          </li>
          <li class="list-group-item">
            Comunicate with your team to not produce more than is needed.
          </li>
          <li class="list-group-item">
            Remember that production can have lead time (<b>{{
              gameSettings.production.LeadProd
            }}</b>
            month) before products are made.
          </li>
        </ul>
      </div>
      <div class="row ms-0 col-12 col-md-6">
        <div class="d-flex flex-column col-12 col-sm-6 p-0 mb-3 mb-sm-0">
          <h3>Air Transport</h3>
          <ul class="list-group">
            <li class="list-group-item">
              Cost: <b>{{ gameSettings.distribution.UAir_Cost }}€</b> per unit
              moved
            </li>
            <li class="list-group-item">
              Emission :
              <b>{{ gameSettings.distribution.UAir_Em }} CO<sub>2</sub></b> per
              one unit
            </li>
            <li class="list-group-item">Lead Time: <b>0</b> month(s)</li>
          </ul>
        </div>
        <div class="d-flex flex-column col-12 col-sm-6 p-0">
          <h3>Sea Transport</h3>
          <ul class="list-group">
            <li class="list-group-item">
              Container Capacity:
              <b>{{ gameSettings.distribution.Cont_Cap }}</b> units
            </li>
            <li class="list-group-item">
              Cost: <b>{{ gameSettings.distribution.Cont_Cost }}€</b> per
              continer moved
            </li>
            <li class="list-group-item">
              Emission:
              <b>{{ gameSettings.distribution.Cont_Em }} CO<sub>2</sub></b> per
              container moved
            </li>
            <li class="list-group-item">Lead Time: <b>1</b> month(s)</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="d-flex flex-column flex-sm-row gap-3">
      <div class="card flex-grow-1">
        <h3>
          <img height="60" :src="img.plane" alt="loading gif" />
          Quantity to transport by Air
        </h3>
        <label class="input">
          <input
            min="0"
            :disabled="!input.airTransportation.enabled"
            class="input__field input__field--textfield"
            type="number"
            placeholder=" "
            v-model="input.airTransportation.quantity"
            @keyup.enter="inputProduction('airTransportation')"
          />
          <span class="input__label">This value cannot be negative</span>
        </label>
        <span class="errorMsg mt-2">{{ input.airTransportation.error }}</span>
        <div class="button-group">
          <img
            height="35"
            :src="img.spin"
            alt="loading gif"
            v-if="!input.airTransportation.enabled"
          />
          <button
            @click="inputProduction('airTransportation')"
            v-if="input.airTransportation.enabled"
          >
            Send
          </button>
          <button
            type="reset"
            @click="loadCharts()"
            v-if="
              productionCost.loaded &&
              productionEmission.loaded &&
              productionQuantity.loaded
            "
          >
            Refresh charts
          </button>
          <img
            height="35"
            class="ms-3"
            :src="img.spin"
            alt="loading gif"
            v-if="
              !productionCost.loaded &&
              !productionEmission.loaded &&
              !productionQuantity.loaded
            "
          />
        </div>
      </div>

      <div class="card flex-grow-1">
        <h3>
          <img height="60" :src="img.ship" alt="loading gif" />
          Quantity to transport by Sea
        </h3>
        <label class="input">
          <input
            min="0"
            :disabled="!input.seaTransportation.enabled"
            class="input__field input__field--textfield"
            type="number"
            placeholder=" "
            v-model="input.seaTransportation.quantity"
            @keyup.enter="inputProduction('seaTransportation')"
          />
          <span class="input__label">This value cannot be negative</span>
        </label>
        <span class="errorMsg mt-2">{{ input.seaTransportation.error }}</span>
        <div class="button-group">
          <img
            height="35"
            :src="img.spin"
            alt="loading gif"
            v-if="!input.seaTransportation.enabled"
          />
          <button
            @click="inputProduction('seaTransportation')"
            v-if="input.seaTransportation.enabled"
          >
            Send
          </button>
          <button
            type="reset"
            @click="loadCharts()"
            v-if="
              productionCost.loaded &&
              productionEmission.loaded &&
              productionQuantity.loaded
            "
          >
            Refresh charts
          </button>
          <img
            height="35"
            class="ms-3"
            :src="img.spin"
            alt="loading gif"
            v-if="
              !productionCost.loaded &&
              !productionEmission.loaded &&
              !productionQuantity.loaded
            "
          />
        </div>
      </div>
    </div>

    <div class="content">
      <div class="overflow-x-auto">
        <h3>Distribution, warehouse and inventory storage table</h3>
        <table
          class="table table-striped table-bordered"
          v-if="distributionValues"
        >
          <thead>
            <tr>
              <th>Month</th>
              <th>Producion Warehouse</th>
              <th>Retail Warehouse</th>
              <th>Quantity by Air</th>
              <th>Quantity by Ship</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in distributionValues" :key="row.month">
              <td>{{ row.month }}</td>
              <td>{{ row.InvtWPB_i }}</td>
              <td>{{ row.InvtWRB_i }}</td>
              <td>{{ row.QTA_i }}</td>
              <td>{{ row.QTS_i }}</td>
            </tr>
          </tbody>
        </table>
        <img
          height="100"
          class="w-100"
          :src="img.spin"
          alt="loading gif"
          v-if="!distributionGrid"
        />
      </div>
      <div class="overflow-x-auto">
        <h3>Distribution, warehouse and inventory storage table</h3>
        <table
          class="table table-striped table-bordered"
          v-if="distributionGrid"
        >
          <thead>
            <tr>
              <th>Month</th>
              <th>Producion Warehouse</th>
              <th>Quantity by Ship</th>
              <th>Quantity by Air</th>
              <th>Inventory Level at the beginning of Month</th>
              <th>Inventory Level at the end of Month</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in distributionGrid" :key="row.month_index">
              <td>{{ row.month }}</td>
              <td>{{ row.InvtWPE }}</td>
              <td>{{ row.QTS_i }}</td>
              <td>{{ row.QTA_i }}</td>
              <td>{{ row.InvtWRB }}</td>
              <td>{{ row.InvtWRE }}</td>
            </tr>
          </tbody>
        </table>
        <img
          height="100"
          class="w-100"
          :src="img.spin"
          alt="loading gif"
          v-if="!distributionGrid"
        />
      </div>
      <h3>Data charts</h3>
      <div class="my-4 row">
        <div class="chart col">
          <h4>Production</h4>
          <img
            height="100"
            class="w-100"
            :src="img.spin"
            alt="loading gif"
            v-if="!productionQuantity.loaded"
          />
          <apexchart
            :height="
              120 + productionQuantity.chartOptions.xaxis.categories.length * 60
            "
            :options="productionQuantity.chartOptions"
            :series="productionQuantity.series"
            v-if="productionQuantity.loaded"
          ></apexchart>
        </div>
        <div class="chart col">
          <h4>Production Costs</h4>
          <img
            height="100"
            class="w-100"
            :src="img.spin"
            alt="loading gif"
            v-if="!productionCost.loaded"
          />
          <apexchart
            :height="120 + productionCost.chartOptions.labels.length * 60"
            :options="productionCost.chartOptions"
            :series="productionCost.series"
            v-if="productionCost.loaded"
          ></apexchart>
        </div>
        <div class="chart col">
          <h4>Production Emission</h4>
          <img
            height="100"
            class="w-100"
            :src="img.spin"
            alt="loading gif"
            v-if="!productionEmission.loaded"
          />
          <apexchart
            :height="120 + productionEmission.chartOptions.labels.length * 60"
            :options="productionEmission.chartOptions"
            :series="productionEmission.series"
            v-if="productionEmission.loaded"
          ></apexchart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import config from "@/config.js";
import { useToast } from "vue-toastification";
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "Production",
  setup() {
    const toast = useToast();
    return { toast };
  },
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      input: {
        airTransportation: {
          quantity: undefined,
          error: "",
          enabled: true,
        },
        seaTransportation: {
          quantity: undefined,
          error: "",
          enabled: true,
        },
      },
      img: {
        spin: require("../../../assets/medias/Spin-1s-200px.svg"),
        plane: require("@/assets/medias/plane.png"),
        ship: require("@/assets/medias/ship.png"),
      },
      distributionValues: null,
      distributionGrid: null,
      productionCost: {
        loaded: false,
        chartOptions: {
          chart: {
            type: "bar",
          },
          plotOptions: {
            bar: {
              horizontal: true,
              dataLabels: {
                //position: 'top',
              },
            },
          },
          dataLabels: {
            enabled: true,
          },
          stroke: {
            show: true,
            width: 1,
            colors: ["#fff"],
          },
          xaxis: {
            labels: {
              formatter: function (val) {
                return val + "€";
              },
            },
          },
          tooltip: {
            shared: true,
            intersect: false,
            y: {
              formatter: function (val) {
                return val + "€";
              },
            },
          },
          legend: {
            position: "top",
            horizontalAlign: "left",
          },
        },
        series: [
          {
            name: "Inventory Holding",
            data: [],
          },
          {
            name: "Production",
            data: [],
          },
        ],
      },
      productionEmission: {
        loaded: false,
        chartOptions: {
          chart: {
            type: "bar",
          },
          plotOptions: {
            bar: {
              horizontal: true,
              dataLabels: {
                //position: 'top',
              },
            },
          },
          dataLabels: {
            enabled: true,
          },
          stroke: {
            show: true,
            width: 1,
            colors: ["#fff"],
          },
          xaxis: {
            labels: {
              formatter: function (val) {
                return val + " CO₂";
              },
            },
          },
          tooltip: {
            shared: true,
            intersect: false,
            y: {
              formatter: function (val) {
                return val + " CO<sub>2</sub>";
              },
            },
          },
          legend: {
            position: "top",
            horizontalAlign: "left",
          },
        },
        series: [
          {
            name: "Inventory Holding",
            data: [],
          },
          {
            name: "Production",
            data: [],
          },
        ],
      },
      productionQuantity: {
        loaded: false,
        series: [
          {
            data: [],
            name: "Units produced",
          },
        ],
        chartOptions: {
          chart: {
            type: "bar",
          },
          plotOptions: {
            bar: {
              horizontal: true,
            },
          },
          stroke: {
            show: true,
            width: 1,
            colors: ["#fff"],
          },
          tooltip: {
            shared: true,
            intersect: false,
          },
          legend: {
            position: "top",
            horizontalAlign: "left",
          },
          xaxis: {
            max: this.$store.state.gameSettings.production.Prod_Cap,
          },
        },
      },
    };
  },

  computed: {
    currentStage() {
      return this.$store.state.gameProgress.currentStage;
    },
    gameSettings() {
      return this.$store.state.gameSettings;
    },
    currentMonth() {
      return this.$store.state.gameProgress.currentMonth + 1;
    },
    gameStatus() {
      return this.$store.state.gameProgress.status;
    },
  },

  watch: {
    "$store.state.gameProgress": "stageChanged",
  },

  methods: {
    dec() {
      this.gauge.series[0] -= 10;
    },
    stageChanged() {
      if (this.currentStage == 0 && this.gameStatus == "running") {
        this.toast("Production stage now begins");
        this.loadCharts();
      }
    },

    logProduction() {
      console.debug("Testing input");
    },

    loadCharts() {
      this.getProductionCost();
      this.getProductionEmission();
      this.getDistributionGrid();
      this.getProductionQuantity();
      this.getDistributionValues();
    },

    inputProduction(type) {
      this.input[type].error = "";

      if (this.currentStage != 1) {
        this.input[type].error = `This is not distribution stage`;
        return;
      } else if (this.gameStatus != "running") {
        this.input[type].error = "Game is not running";
        return;
      }

      if (
        isNaN(this.input[type].quantity) ||
        this.input[type].quantity < 0 ||
        this.input[type].quantity == undefined
      ) {
        console.debug("wrong value");
        this.input[type].error = "The value cannot be negative";
        return;
      }

      this.input[type].enabled = false;

      let body = null;

      if (type == "airTransportation") {
        body = {
          QTA_i: this.input[type].quantity,
        };
      } else {
        body = {
          QTS_i: this.input[type].quantity,
        };
      }

      fetch(
        `${config.gameApi.url}/distribution/${this.$store.state.player.team.name}/${this.$store.state.player.gameId}/${this.currentMonth}/${type}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
          body: JSON.stringify(body),
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("Distribution input: ", data);

          if (response.status === 400) {
            this.input[type].error = data.message;
            //toast.error(data.message)
            this.input[type].enabled = true;
            return;
          }

          if (!data.success) {
            this.input[type].error = data.message;
            //toast.error(data.message)
            return;
          }

          this.input[type].enabled = true;
          this.loadCharts();
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    getProductionCost() {
      this.productionCost.loaded = false;
      fetch(
        `${config.gameApi.url}/analytics/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/production-cost`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("Production cost: ", data);

          this.productionCost.series[0].data = data.datasets[1].data.slice(
            0,
            this.currentMonth
          );
          this.productionCost.series[1].data = data.datasets[0].data.slice(
            0,
            this.currentMonth
          );
          this.productionCost.chartOptions.labels = data.labels.slice(
            0,
            this.currentMonth
          );

          this.productionCost.loaded = true;
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    getProductionEmission() {
      this.productionEmission.loaded = false;
      fetch(
        `${config.gameApi.url}/analytics/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/production-emission`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("Production emission: ", data);

          this.productionEmission.chartOptions.labels = data.labels.slice(
            0,
            this.currentMonth
          );

          this.productionEmission.series[0].data = data.datasets[1].data.slice(
            0,
            this.currentMonth
          );
          this.productionEmission.series[1].data = data.datasets[0].data.slice(
            0,
            this.currentMonth
          );

          this.productionEmission.loaded = true;
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    getProductionQuantity() {
      this.productionQuantity.loaded = false;
      fetch(
        `${config.gameApi.url}/analytics/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/production`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("Production quantity: ", data);

          this.productionQuantity.series[0].data = data.datasets[0].data.slice(
            0,
            this.currentMonth
          );
          this.productionQuantity.chartOptions.xaxis.categories =
            data.labels.slice(0, this.currentMonth);

          this.productionQuantity.loaded = true;
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    getDistributionGrid() {
      this.distributionGrid = null;
      fetch(
        `${config.gameApi.url}/grid/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/distribution`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("Production grid: ", data);
          this.distributionGrid = data.rowData; //.slice(0,this.currentMonth)
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    getDistributionValues() {
      this.distributionValues = null;
      fetch(
        `${config.gameApi.url}/distribution/${this.$store.state.player.team.name}/${this.$store.state.player.gameId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("distributionValues: ", data);
          this.distributionValues = data.months; //.slice(0,this.currentMonth)
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },
  },

  mounted() {
    this.loadCharts();
  },
};
</script>

<style lang="scss">
.errorMsg {
  color: #ff0000;
}
</style>
