<template>
    <div>
        <div class="loading vw-100 d-flex justify-content-center align-items-center">
            <img height="200" :src="img.loading" alt="loading gif">
        </div>
    </div>
</template>

<script>
   export default {
    name: 'Loading image',
    data () {
      return {
        img:{
          loading: require('../assets/medias/Wedges-3s-200px.gif'),
        } 
      }
    },
  }
  </script>

  <style lang="scss">
    .loading{
      height: 250px;
    }
  </style>
  