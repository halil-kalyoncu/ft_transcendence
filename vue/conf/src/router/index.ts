import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import ErrorLayout from '../components/ErrorLayout.vue'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import jwtDecode from 'jwt-decode'

const jwtGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const accessToken = localStorage.getItem('ponggame')
  if (accessToken) {
    try {
      const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
      console.log(decodedToken)
      const expirationTime: number = (decodedToken.exp as number) * 1000

      if (Date.now() >= expirationTime) {
        // Token has expired
        next('/')
      } else {
        // Token is valid
        next()
      }
    } catch (error) {
      // Token verification failed
      next('/')
    }
  } else {
    // Token does not exist
    next('/')
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      ],
      beforeEnter: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
      ): void => jwtGuard(to, from, next)
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
      ],
      beforeEnter: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
      ): void => jwtGuard(to, from, next)
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
      ],
      beforeEnter: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
      ): void => jwtGuard(to, from, next)
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: ErrorLayout,
      children: [
        {
          path: '',
          component: () => import('../views/NotFound.vue') //lazy load
        }
      ]
    }
  ]
})

export default router
