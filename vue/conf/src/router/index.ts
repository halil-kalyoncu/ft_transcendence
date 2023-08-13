import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../components/layout/MainLayout.vue'
import ErrorLayout from '../components/layout/ErrorLayout.vue'
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
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
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
      path: '/profile/:username',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'profile',
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
      path: '/settings',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'settings',
          component: () => import('../views/SettingsView.vue') //lazy load
        }
      ],
      beforeEnter: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
      ): void => jwtGuard(to, from, next)
    },
    {
      path: '/activity-center',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'activity-center',
          component: () => import('../views/ActivityCenterView.vue') //lazy load
        }
      ],
      beforeEnter: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
      ): void => jwtGuard(to, from, next)
    },
    // {
    //   path: '/profile/:matchId',
    //   component: MainLayout,
    //   children: [
    //     {
    //       path: '',
    //       name: 'invite',
    //       component: () => import('../components/invite/Invite.vue') //lazy load
    //     }
    //   ],
    //   beforeEnter: (
    //     to: RouteLocationNormalized,
    //     from: RouteLocationNormalized,
    //     next: NavigationGuardNext
    //   ): void => jwtGuard(to, from, next)
    // },
    {
      path: '/game',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'game',
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
      path: '/invite/:matchId',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'invite',
          component: () => import('../views/InviteView.vue') //lazy load
        }
      ],
      props: true,
      beforeEnter: (
        to: RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
      ): void => jwtGuard(to, from, next)
    },
    {
      path: '/:catchAll(.*)',
      component: ErrorLayout,
      children: [
        {
          path: '',
          name: 'NotFound',
          component: () => import('../views/NotFound.vue') //lazy load
        }
      ]
    }
  ]
})

export default router
