import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: 'Дашборд' }
    },
    {
      path: '/masks',
      name: 'masks',
      component: () => import('@/views/MasksView.vue'),
      meta: { title: 'Маски' }
    },
    {
      path: '/spools',
      name: 'spools',
      component: () => import('@/views/SpoolsView.vue'),
      meta: { title: 'Катушки' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Главная'} | ООО "Юпитер"`
  next()
})

export default router

