import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserI } from '../model/user.interface'
import jwtDecode from 'jwt-decode'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserI | null>(null)
  const userId = ref<number>(0)
  const username = ref<string>('')
  const avatarImageData = ref<Blob | null>(null)

  async function fetchUser() {
    const jwtUser: UserI = getUserFromAccessToken()
    const jwtUserId: number = jwtUser.id as number

    const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_BACKENDPORT}/api/users/find-by-id?id=${jwtUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
      }
    })

    const responseData = await response.json()
    if (response.ok) {
      user.value = responseData
      userId.value = user.value?.id as number
      username.value = user.value?.username as string
    } else {
      clearStore()
      throw new Error('Failed to fetch user ' + responseData)
    }
  }

  async function fetchAvatar() {
    if (!user.value || !user.value.avatarId) {
      return
    }

    const jwtUser: UserI = getUserFromAccessToken()
    const jwtUserId: number = jwtUser.id as number

    const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_BACKENDPORT}/api/users/avatar/${jwtUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
      }
    })

    if (response.ok) {
      avatarImageData.value = await response.blob()
    } else {
      clearAvatar()
      throw new Error('Failed to fetch avatar')
    }
  }

  async function initStore() {
    await fetchUser()
    if (user.value) {
      await fetchAvatar()
    }
  }

  async function mountStore() {
    if (user.value) {
      return
    }
    await initStore()
  }

  function clearUser() {
    user.value = null
    userId.value = 0
    username.value = ''
  }

  function clearAvatar() {
    avatarImageData.value = null
  }

  function clearStore() {
    clearUser()
    clearAvatar()
  }

  function getUserFromAccessToken(): UserI {
    const accessToken = localStorage.getItem('ponggame') ?? ''
    const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
    return decodedToken.user as UserI
  }

  return {
    user,
    username,
    userId,
    avatarImageData,
    fetchUser,
    fetchAvatar,
    initStore,
    mountStore,
    clearUser,
    clearAvatar,
    clearStore
  }
})
