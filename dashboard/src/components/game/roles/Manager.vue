<template>
  <div id="manager" class="d-flex flex-column">
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

    <button class="button" @click="loadCharts">Refresh View</button>

    <loading v-if="!supply" />

    <div class="d-flex flex-column me-4" v-if="summary">
      <h5>Summary</h5>
      <p>
        Total profit: <b>{{ summary.totalProfit }}</b
        >€
      </p>
      <p>
        Total cost: <b>{{ summary.totalCost }}</b
        >€
      </p>
      <p>
        Net profit: <b>{{ summary.netProfit }}</b
        >€
      </p>
      <p>
        Total emission: <b>{{ summary.totalEmission }}</b> CO<sub>2</sub>
      </p>
    </div>

    <h3>Data charts</h3>
    <div class="my-4 row">
      <div class="chart col">
        <h4>Emission</h4>
        <img
          height="100"
          class="w-100"
          :src="img.spin"
          alt="loading gif"
          v-if="!emission.loaded"
        />
        <apexchart
          :height="120 + emission.chartOptions.labels.length * 30"
          :options="emission.chartOptions"
          :series="emission.series"
          v-if="emission.loaded"
        ></apexchart>
      </div>
      <div class="chart col">
        <h4>Cost</h4>
        <img
          height="100"
          class="w-100"
          :src="img.spin"
          alt="loading gif"
          v-if="!cost.loaded"
        />
        <apexchart
          :height="120 + cost.chartOptions.labels.length * 30"
          :options="cost.chartOptions"
          :series="cost.series"
          v-if="cost.loaded"
        ></apexchart>
      </div>
    </div>

    <div id="supplyChain" v-if="supply">
      <div class="mt-3">
        <h5>Cash Flow table</h5>
        <div class="overflow-x-auto">
          <table class="table table-striped table-bordered">
            <thead>
              <tr>
                <th rowspan="2" class="align-middle">Month</th>
                <th colspan="3" class="profit-bg">Profit</th>
                <th colspan="6" class="cost-bg">Cost</th>
              </tr>
              <tr>
                <th class="profit-bg">Cash Flow</th>
                <th class="profit-bg">NetProfit</th>
                <th class="profit-bg">Revenue</th>
                <th class="cost-bg">Total Costs</th>
                <th class="cost-bg">Production</th>
                <th class="cost-bg">Inventory (W1)</th>
                <th class="cost-bg">Transportation by Boat</th>
                <th class="cost-bg">Transportation by Air</th>
                <th class="cost-bg">Inventory (W2)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in supply" :key="row.id">
                <td>{{ row.month }}</td>
                <td class="profit-bg">{{ row.profits.cashFlow }}€</td>
                <td class="profit-bg">{{ row.profits.net }}€</td>
                <td class="profit-bg">{{ row.profits.revenu }}€</td>
                <td class="cost-bg">{{ row.costs.total }}€</td>
                <td class="cost-bg">{{ row.costs.Prod_Cost }}€</td>
                <td class="cost-bg">{{ row.costs.inventory.wp }}€</td>
                <td class="cost-bg">{{ row.costs.transportation.sea }}€</td>
                <td class="cost-bg">{{ row.costs.transportation.air }}€</td>
                <td class="cost-bg">{{ row.costs.inventory.wr }}€</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-3">
        <h3>Emission table</h3>
        <div class="overflow-x-auto">
          <table class="table table-striped table-bordered">
            <thead>
              <tr>
                <th rowspan="2" class="align-middle">Month</th>
                <th colspan="4" class="emission-bg">Emission</th>
                <th rowspan="2" class="emission-bg">Total Emission</th>
              </tr>
              <tr>
                <th class="emission-bg">Production</th>
                <th class="emission-bg">Inventory (W1)</th>
                <th class="emission-bg">Transportation</th>
                <th class="emission-bg">Inventory (W2)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in supply" :key="row.id">
                <td>{{ row.month }}</td>
                <td class="emission-bg">
                  {{ row.emissions.production }} CO<sub>2</sub>
                </td>
                <td class="emission-bg">
                  {{ row.emissions.inventory.wp }} CO<sub>2</sub>
                </td>
                <td class="emission-bg">
                  {{ row.emissions.transportation }} CO<sub>2</sub>
                </td>
                <td class="emission-bg">
                  {{ row.emissions.inventory.wr }} CO<sub>2</sub>
                </td>
                <td class="emission-bg">
                  {{ row.emissions.total }} CO<sub>2</sub>
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
//import Sidebar from "@/components/Sidebar";
import config from "@/config.js";
import { useToast } from "vue-toastification";
import Loading from "../../Loading.vue";
import VueApexCharts from "vue3-apexcharts";

const toast = useToast();

export default {
  name: "Manager role",
  components: {
    Loading,
    apexchart: VueApexCharts,
  },
  data() {
    return {
      color: "blue",
      supply: null,
      summary: null,
      img: {
        spin: require("@/assets/medias/Spin-1s-200px.svg"),
      },
      emission: {
        loaded: false,
        series: [
          {
            data: [],
            name: "CO produced",
          },
        ],
        chartOptions: {
          title: {
            text: "Emission chart",
          },
          chart: {
            type: "bar",
            height: 350,
            stacked: true,
            toolbar: {
              show: true,
            },
          },
          plotOptions: {
            bar: {
              horizontal: true,
              dataLabels: {
                hideOverflowingLabels: false,
                total: {
                  enabled: true,
                  offsetX: 0,
                  style: {
                    fontWeight: 900,
                  },
                },
              },
            },
          },
          stroke: {
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
          yaxis: {
            title: {
              text: "Months",
            },
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + " CO<sub>2</sub>";
              },
            },
          },
          fill: {
            opacity: 1,
          },
          legend: {
            position: "top",
            horizontalAlign: "left",
          },
          labels: [],
        },
      },
      cost: {
        loaded: false,
        chartOptions: {
          title: {
            text: "Cost chart",
          },
          chart: {
            type: "bar",
            height: 350,
            stacked: true,
            toolbar: {
              show: true,
            },
          },
          plotOptions: {
            bar: {
              horizontal: true,
              dataLabels: {
                hideOverflowingLabels: false,
                total: {
                  enabled: true,
                  offsetX: 0,
                  style: {
                    fontWeight: 900,
                  },
                },
              },
            },
          },
          stroke: {
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
          yaxis: {
            title: {
              text: "Months",
            },
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + "€";
              },
            },
          },
          fill: {
            opacity: 1,
          },
          legend: {
            position: "top",
            horizontalAlign: "left",
            offsetX: 40,
          },
          labels: [],
        },
      },
    };
  },

  watch: {
    "$store.state.gameProgress": "stageChanged",
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

  methods: {
    stageChanged() {
      if (this.currentStage == 3 && this.gameStatus == "running") {
        this.loadCharts();
      }
    },

    supplyChain() {
      this.supply = null;
      this.summary = null;
      fetch(
        `${config.gameApi.url}/manage/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/supply_chain`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();

          this.supply = data.result.results.slice(0, this.currentMonth);
          delete data.result.results;
          this.summary = data.result;

          console.debug("Supply chain", data);
        })
        .catch((error) => {
          toast.error(error.toString());
        });
    },

    getEmission() {
      fetch(
        `${config.gameApi.url}/analytics/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/emission`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();

          this.emission.chartOptions.labels = data.labels.slice(
            0,
            this.currentMonth
          );

          data.datasets.forEach((element) => {
            element.data = element.data.slice(0, this.currentMonth);
          });

          this.emission.series = data.datasets;

          this.emission.loaded = true;

          console.debug("Manager -  Emission", data);
        })
        .catch((error) => {
          toast.error(error.toString());
        });
    },

    getCost() {
      fetch(
        `${config.gameApi.url}/analytics/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/cost`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();

          this.cost.chartOptions.labels = data.labels.slice(
            0,
            this.currentMonth
          );

          data.datasets.forEach((element) => {
            element.data = element.data.slice(0, this.currentMonth);
          });

          this.cost.series = data.datasets;

          this.cost.loaded = true;

          console.debug("Manager - Cost", data);
        })
        .catch((error) => {
          toast.error(error.toString());
        });
    },

    loadCharts() {
      this.getEmission(), this.supplyChain();
      this.getCost();
    },
  },

  mounted() {
    this.loadCharts();
  },
};
</script>

<style lang="scss">
th {
  color: #0070c0;
}
</style>
