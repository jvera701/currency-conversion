import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Graph from '../views/Graph.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/graph',
      name: 'graph',
      component: Graph
    }
  ]
})

export default router
