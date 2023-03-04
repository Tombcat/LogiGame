<template>
  <div id="production" class="d-flex flex-column gap-4">
    <div class="row">
      <div class="col-12 col-md-6">
        <h3>
          Hello {{ this.$store.state.player.username }}, you are responsible for
          <span class="production">Production.</span>
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
          <h3>Production settings</h3>
          <ul class="list-group">
            <li class="list-group-item">
              Limit: <b>{{ gameSettings.production.Prod_Cap }}</b> units
            </li>
            <li class="list-group-item">
              Cost: <b>{{ gameSettings.production.UProd_Cost }}</b> per one unit
            </li>
            <li class="list-group-item">
              Emission: <b>{{ gameSettings.production.UProd_Em }}</b> per one
              unit
            </li>
            <li class="list-group-item">
              Lead Time: <b>{{ gameSettings.production.LeadProd }}</b> month(s)
            </li>
          </ul>
        </div>
        <div class="d-flex flex-column col-12 col-sm-6 p-0">
          <h3>Warehouse settings</h3>
          <ul class="list-group">
            <li class="list-group-item">
              Capacity: <b>{{ gameSettings.production.WP_Cap }}</b> units
            </li>
            <li class="list-group-item">
              Holding cost:
              <b>{{ gameSettings.production.UHoldWP_Cost }}</b> per one unit
            </li>
            <li class="list-group-item">
              Emission: <b>{{ gameSettings.production.UHoldWP_Em }}</b> per one
              unit
            </li>
            <li class="list-group-item">
              Initial Stock Level:
              <b>{{ gameSettings.production.InvtWPB_0 }}</b> units
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>
        <img height="60" :src="img.industry" alt="loading gif" />
        Quantity to produce goods
      </h3>
      <label class="input">
        <input
          min="0"
          :disabled="!input.enabled"
          class="input__field input__field--textfield"
          type="number"
          placeholder=" "
          v-model="input.quantity"
          @keyup.enter="inputProduction"
        />
        <span class="input__label">The value cannot be negative</span>
      </label>
      <span class="errorMsg mt-2">{{ input.error }}</span>
      <div class="button-group">
        <img
          height="35"
          :src="img.spin"
          alt="loading gif"
          v-if="!input.enabled"
        />
        <button @click="inputProduction" v-if="input.enabled">Send</button>
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
    <div class="content">
      <div class="overflow-x-auto">
        <h3>Production & Warehouse storage table</h3>
        <table
          class="table table-striped table-bordered"
          v-if="productionValues"
        >
          <thead>
            <tr>
              <th>Month</th>
              <th>Production quantity</th>
              <th>Warehouse begining on month</th>
              <th>Warehouse end on month</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in productionValues" :key="row.month">
              <td>{{ row.month }}</td>
              <td>{{ row.Qt }}</td>
              <td>{{ row.InvtWPB_i }}</td>
              <td>{{ row.InvtWPE_i }}</td>
            </tr>
          </tbody>
        </table>
        <img
          height="100"
          class="w-100"
          :src="img.spin"
          alt="loading gif"
          v-if="!productionGrid"
        />
      </div>
      <div class="overflow-x-auto">
        <h3>Production & Warehouse storage table</h3>
        <table class="table table-striped table-bordered" v-if="productionGrid">
          <thead>
            <tr>
              <th>Month</th>
              <th>Production quantity</th>
              <th>Warehouse begining on month</th>
              <th>Warehouse end on month</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in productionGrid" :key="row.month_index">
              <td>{{ row.month }}</td>
              <td>{{ row.Qt }}</td>
              <td>{{ row.InvtWPB }}</td>
              <td>{{ row.InvtWPE }}</td>
            </tr>
          </tbody>
        </table>
        <img
          height="100"
          class="w-100"
          :src="img.spin"
          alt="loading gif"
          v-if="!productionGrid"
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
        quantity: undefined,
        error: "",
        enabled: true,
      },
      img: {
        spin: require("../../../assets/medias/Spin-1s-200px.svg"),
        industry: require("../../../assets/medias/industry-1.1s-200px.svg"),
      },
      productionValues: null,
      productionGrid: null,
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
      this.getProductionGrid();
      this.getProductionQuantity();
      this.getProductionValues();
    },

    inputProduction() {
      this.input.error = "";

      console.debug("Quanity", this.input.quantity);

      if (this.currentStage != 0) {
        this.input.error = `This is not production stage`;
        return;
      } else if (this.gameStatus != "running") {
        this.input.error = "Game is not running";
        return;
      }

      if (
        isNaN(this.input.quantity) ||
        this.input.quantity < 0 ||
        this.input.quantity == undefined
      ) {
        console.debug("wrong value");
        this.input.error = "The value cannot be negative";
        return;
      }

      this.input.enabled = false;

      fetch(
        `${config.gameApi.url}/production/${this.$store.state.player.team.name}/${this.$store.state.player.gameId}/${this.currentMonth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
          body: JSON.stringify({
            Qt: this.input.quantity,
          }),
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("Production input: ", data);

          if (response.status === 400) {
            this.input.error = data.message;
            //toast.error(data.message)
            this.input.enabled = true;
            return;
          }

          if (!data.success) {
            this.input.error = data.message;
            //toast.error(data.message)
            return;
          }

          this.input.enabled = true;
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

    getProductionGrid() {
      this.productionGrid = null;
      fetch(
        `${config.gameApi.url}/grid/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/production`,
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
          this.productionGrid = data.rowData; //.slice(0,this.currentMonth)
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    getProductionValues() {
      this.productionValues = null;
      fetch(
        `${config.gameApi.url}/production/${this.$store.state.player.team.name}/${this.$store.state.player.gameId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("productionValues: ", data);
          this.productionValues = data.months; //.slice(0,this.currentMonth)
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
