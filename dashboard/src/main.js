import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import Toast from "vue-toastification"
import "bootstrap/dist/css/bootstrap.css"
import "vue-toastification/dist/index.css";
import VueCookies from 'vue-cookies'

createApp(App)
.use(Toast)
    .use(store)
    .use(router)
    .use(VueCookies, { expires: '7d'})
    //.use(VueApexCharts)
    .mount('#app');

import "bootstrap/dist/js/bootstrap.js"