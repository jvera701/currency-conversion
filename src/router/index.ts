import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Graph from '../views/Graph.vue'
import { useUserStore } from '../stores/user'

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

router.beforeEach(async (to) => {
  const store = useUserStore()
  // if user is not authenticated redirect to login page
  if (store.token === '' && to.name !== 'login') {
    return { name: 'login' }
  }
})

export default router
