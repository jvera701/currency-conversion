import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import GraphPage from '../views/GraphPage.vue'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/graph',
      name: 'graph',
      component: GraphPage
    }
  ]
})

router.beforeEach(async (to) => {
  const store = useUserStore()
  // if user is not authenticated redirect to login page
  if (store.token === '' && to.name !== 'login') {
    return { name: 'login' }
  }

  // if user is authenticated, redirect to graph page
  if (store.token !== '' && to.name !== 'graph') {
    return { name: 'graph' }
  }
})

export default router
