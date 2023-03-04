import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: 'Home'
    }
  },
  {
    path: '/Login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: 'Login'
    }
  },
  {
    path: '/Signup',
    name: 'Signup',
    component: () => import('../views/Signup.vue'),
    meta: {
      title: 'Signup'
    }
  },
  {
    path: '/Dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/Play',
    name: 'Play',
    component: () => import('../views/Play.vue'),
    meta: {
      title: 'Play'
    }
  },
  {
    path: '/Logout',
    name: 'Logout',
    component: () => import('../views/Logout.vue'),
    meta: {
      title: 'Logout'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  next()
})

export default router
