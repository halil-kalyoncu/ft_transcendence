import { describe, expect, test, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SideBar from '@/components/layout/SideBar.vue'
import Friends from '@/components/friends/Friends.vue'
import Channels from '@/components/channels/Channels.vue'
import { createPinia } from 'pinia'
import { config } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

//('.navButton')[0] is Friends Button
//('.navButton')[1] is Channels Button

const history = createMemoryHistory()
const router = createRouter({
  history,
  routes: [
    { path: '/', component: {} },
    { path: '/home', component: {} },
    { path: '/profile', component: {} }
  ]
})

beforeEach(() => {
  router.push('/').catch(() => {})
})

config.global.mocks = {
  $route: router.currentRoute,
  $router: router
}

describe('SideBar', () => {
  test('toggles Friends and Channels visibility correctly', async () => {
    const wrapper = mount(SideBar, {
      global: {
        plugins: [createPinia(), router],
        stubs: {
          Friends,
          Channels
        }
      }
    })

    expect(wrapper.findComponent(Friends).isVisible()).toBe(true)
    expect(wrapper.findComponent(Channels).isVisible()).toBe(false)

    await wrapper.findAll('.navButton')[1].trigger('click')
    expect((wrapper.findComponent(Friends).element as HTMLElement).style.display).toBe('none')
    expect((wrapper.findComponent(Channels).element as HTMLElement).style.display).not.toBe('none')

    await wrapper.findAll('.navButton')[0].trigger('click')
    expect(wrapper.findComponent(Friends).isVisible()).toBe(true)
    expect(wrapper.findComponent(Channels).isVisible()).toBe(false)
  })

  test('applies "selected" class correctly', async () => {
    const wrapper = mount(SideBar, {
      global: {
        plugins: [createPinia(), router],
        stubs: {
          Friends,
          Channels
        }
      }
    })

    expect(wrapper.findAll('.navButton')[0].classes()).toContain('selected')
    expect(wrapper.findAll('.navButton')[1].classes()).not.toContain('selected')

    await wrapper.findAll('.navButton')[1].trigger('click')
    expect(wrapper.findAll('.navButton')[0].classes()).not.toContain('selected')
    expect(wrapper.findAll('.navButton')[1].classes()).toContain('selected')
  })
})
