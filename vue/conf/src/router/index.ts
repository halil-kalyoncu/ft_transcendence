import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import ErrorLayout from '../components/ErrorLayout.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'home',
    component: MainLayout,
    children: [
      {
        path: '',
        component: HomeView
      }
    ]
  },
  {
    path: '/profile',
    name: 'profile',
    component: MainLayout,
    children: [
      {
        path: '',
        component: () => import('../views/ProfileView.vue') //lazy load
      }
    ]
  },
  {
    path: '/game',
    name: 'game',
    component: MainLayout,
    children: [
      {
        path: '',
        component: () => import('../views/GameView.vue') //lazy load
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: ErrorLayout,
    children: [
      {
        path: '',
        component: () => import('../views/NotFound.vue') //lazy load
      },
    ],
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router