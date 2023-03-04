<template>
  <div id="production" class="d-flex flex-column gap-4">
    <div class="row">
      <div class="col-12 col-md-6">
        <h3>
          Hello {{ this.$store.state.player.username }}, you are responsible for
          <span class="sales">Sales.</span>
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

    <div>
      <h3>Advertisment options</h3>
      <div class="d-flex flex-row w-100 gap-2 flex-wrap">
        <div
          v-for="ad in gameSettings.advertisements"
          :key="ad._id"
          class="bg-dark text-white p-3 flex-grow-1"
        >
          <h5>{{ ad.option }}. {{ ad.Comment }}</h5>
          <span
            >Yield Impact: <b>{{ ad.Yield_Impact }}</b></span
          >
          <p>
            Budget: <b>{{ ad.Budget.toLocaleString() }}€</b>
          </p>
          <button @click="advertisement(ad.option)" class="w-100">Apply</button>
        </div>
      </div>
    </div>

    <div class="d-flex flex-column flex-sm-row gap-3">
      <div class="card flex-grow-1">
        <h3>
          <img height="60" :src="img.store" alt="loading gif" />
          Price for items
        </h3>
        <label class="input">
          <input
            min="0"
            :disabled="!input.price.enabled"
            class="input__field input__field--textfield"
            type="number"
            placeholder=" "
            v-model="input.price.quantity"
            @keyup.enter="inputProduction('price')"
          />
          <span class="input__label">This value cannot be negative</span>
        </label>
        <span class="errorMsg mt-2">{{ input.price.error }}</span>
        <div class="button-group">
          <img
            height="35"
            :src="img.spin"
            alt="loading gif"
            v-if="!input.price.enabled"
          />
          <button @click="inputProduction('price')" v-if="input.price.enabled">
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
        <h3>Sales Grid</h3>
        <table class="table table-striped table-bordered" v-if="salesGrid">
          <thead>
            <tr>
              <th>Month</th>
              <th>Comment</th>
              <th>Forecast</th>
              <th>InvtWRE</th>
              <th>Price</th>

              <th>Real demand</th>
              <th>Lost sales</th>
              <th>Sales</th>
              <th>Revenu</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in salesGrid" :key="row.month">
              <td>{{ row.month }}</td>
              <td>{{ row.Comment }}</td>
              <td>{{ row.Forecast }}</td>
              <td>{{ row.InvtWRE }}</td>
              <td>{{ row.price.toLocaleString() }}€</td>

              <td>{{ row.RealDemand }}</td>
              <td>{{ row.LostSales }}</td>
              <td>{{ row.Sales }}</td>
              <td>{{ row.Revenu.toLocaleString() }}€</td>
            </tr>
          </tbody>
        </table>
        <img
          height="100"
          class="w-100"
          :src="img.spin"
          alt="loading gif"
          v-if="!salesValues"
        />
      </div>
      <div class="overflow-x-auto">
        <h3>Sales value table</h3>
        <table class="table table-striped table-bordered" v-if="salesValues">
          <thead>
            <tr>
              <th>Month</th>
              <th>Advertisement</th>
              <th>InvtWRB_i</th>
              <th>InvtWRE_i</th>
              <th>LostSales</th>
              <th>Price</th>
              <th>RealDemand</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in salesValues" :key="row.month_index">
              <td>{{ row.month }}</td>
              <td>{{ row.Advertisement }}</td>
              <td>{{ row.InvtWRB_i }}</td>
              <td>{{ row.InvtWRE_i }}</td>
              <td>{{ row.LostSales }}</td>
              <td>{{ row.Price }}</td>
              <td>{{ row.RealDemand }}</td>
              <td>{{ row.Sales }}</td>
            </tr>
          </tbody>
        </table>
        <img
          height="100"
          class="w-100"
          :src="img.spin"
          alt="loading gif"
          v-if="!salesValues"
        />
      </div>
      <h3>Data charts (in progress)</h3>
      <div class="my-4 row" v-if="!true">
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
        price: {
          quantity: undefined,
          error: "",
          enabled: true,
        },
        advertisment: {
          quantity: undefined,
          error: "",
          enabled: true,
        },
      },
      img: {
        spin: require("../../../assets/medias/Spin-1s-200px.svg"),
        store: require("@/assets/medias/store.png"),
        ads: require("@/assets/medias/ads.png"),
      },
      salesGrid: null,
      salesValues: null,
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
      if (this.currentStage == 2 && this.gameStatus == "running") {
        this.toast("Sales stage now begins");
        this.loadCharts();
      }
    },

    logProduction() {
      console.debug("Testing input");
    },

    loadCharts() {
      this.getProductionCost();
      this.getProductionEmission();
      this.getSalesValues();
      this.getSalesGrid();
      //this.getTest()
      this.getProductionQuantity();
    },

    inputProduction(type) {
      this.input[type].error = "";

      if (this.currentStage != 2) {
        this.input[type].error = `This is not sales stage`;
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

      if (type == "price") {
        body = {
          price: this.input[type].quantity,
        };
      } else {
        body = {
          QTS_i: this.input[type].quantity,
        };
      }

      fetch(
        `${config.gameApi.url}/sales/${this.$store.state.player.team.name}/${this.$store.state.player.gameId}/${this.currentMonth}/${type}`,
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

    getSalesGrid() {
      this.salesGrid = null;
      fetch(
        `${config.gameApi.url}/grid/${this.$store.state.player.gameId}/${this.$store.state.player.team.name}/sales`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("salesGrid: ", data);
          this.salesGrid = data.rowData; //.slice(0,this.currentMonth)
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    getSalesValues() {
      this.salesValues = null;
      fetch(
        `${config.gameApi.url}/sales/${this.$store.state.player.team.name}/${this.$store.state.player.gameId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("salesValues: ", data);
          this.salesValues = data.months; //.slice(0,this.currentMonth)
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    advertisement(option) {
      /*if(this.currentStage != 2){
                    this.input[type].error = `This is not sales stage`
                    return
                }else if(this.gameStatus != 'running'){
                    this.input[type].error = "Game is not running"
                    return    
                }*/

      /*if(isNaN(this.input[type].quantity) || this.input[type].quantity < 0 || this.input[type].quantity == undefined){
                    console.debug("wrong value")
                    this.input[type].error = "The value cannot be negative"
                    return
                }*/

      //this.input[type].enabled = false

      //let body = null;

      /*if(type == 'price'){
                    body = {
                        "price": this.input[type].quantity
                    }
                }else{
                    body = {
                        "QTS_i": this.input[type].quantity
                    }
                }*/

      fetch(
        `${config.gameApi.url}/sales/${this.$store.state.player.team.name}/${this.$store.state.player.gameId}/${this.currentMonth}/advertisement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.$store.state.user.token}`,
          },
          body: JSON.stringify({
            Adv_i: option,
          }),
        }
      )
        .then(async (response) => {
          let data = await response.json();
          console.debug("Advertisement input: ", data);

          /*if (response.status === 400) {
                        this.input[type].error = data.message
                        //toast.error(data.message)
                        this.input[type].enabled = true
                        return
                    }

                    if(!data.success){
                        this.input[type].error = data.message
                        //toast.error(data.message)
                        return
                    }

                    this.input[type].enabled = true*/
          this.loadCharts();
        })
        .catch((error) => {
          this.toast.error(error.toString());
        });
    },

    /*getTest(){
                
                fetch(`${config.gameApi.url}/sales/${this.$store.state.player.gameId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${this.$store.state.user.token}`
                    }
                })
                .then(async response => {
                    let data = await response.json();
                    console.debug("test: ", data)
                    this.salesGrid = data.rawData//.slice(0,this.currentMonth)
                })
                .catch(error => {
                    this.toast.error(error.toString());
                });
            }*/
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
