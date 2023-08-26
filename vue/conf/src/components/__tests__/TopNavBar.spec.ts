import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { config } from '@vue/test-utils'
import TopNavBar from '../layout/TopNavBar.vue'
import { beforeEach, describe, expect, test } from 'vitest'
import { createPinia } from 'pinia'

const history = createMemoryHistory()
const router = createRouter({
  history,
  routes: [
    { path: '/', component: {} },
    { path: '/home', component: {} },
    { path: '/settings', component: {} },
    { path: '/activity-center', component: {} }
  ]
})

beforeEach(() => {
  router.push('/').catch(() => {})
})

config.global.mocks = {
  $route: router.currentRoute,
  $router: router
}

describe('TopNavBar', () => {
  test('renders and applies "selected" class correctly', async () => {
    const wrapper = mount(TopNavBar, {
      global: {
        plugins: [createPinia(), router]
      }
    })

    expect(wrapper.get('.navButton').classes()).not.toContain('selected')

    await router.push('/home')
    await wrapper.vm.$nextTick()
    expect(wrapper.get('.navButton').classes()).toContain('selected')
  })
})
