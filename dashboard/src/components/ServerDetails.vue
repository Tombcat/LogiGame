<template>
    <div id="serverDetails" class="d-flex flex-column align-items-center">
      <div class="__content w-100 p-3 row">
        <div class="col-5">
          <h4>Server Details: </h4>
          <p>Game ID: {{ server.id }}</p>
          <p>Server name: {{ server.name }}</p>
          <p>Months: {{ server.nMonths }}</p>
          <p>Players: {{ server.players }}</p>
        </div>
        <div class="col-7">
          <HostView/>
        </div>
      </div>
      <div class="__button text-center">
        <p class="m-0 p-1">
          SERVER
        </p> 
      </div>
    </div>
  </template>
  
  <script>
  import HostView from "@/components/HostView";

  export default {
    name: 'ServerDetails',
    components: {
        HostView
    },
    data () {
      return {
        //connection: null
      }
    },
    computed:{
      server(){
          return this.$store.state.server
      }
    },
    methods:{
    }
  }
  </script>
  
  <style lang="scss" scoped>
  #serverDetails{
    position: absolute;
    width: 40rem;
    top: 2.4rem;
    color:#fff;
    .__button{
      border-radius: 0 0 20px 20px;
      width: 10rem;
      background-color: rgba($primary-color, .8);
    }
    .__content{
      border-radius: 0 0 20px 20px;
      background-color: $primary-color;
    }
  }
  </style>