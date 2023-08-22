import { useUserStore } from '../stores/userInfo'
import { useNotificationStore } from '../stores/notification'

export const fetchAndSaveAvatar = async () => {
    const userStore = useUserStore()
    const notificationStore = useNotificationStore()

    try {
        const response = await fetch(`http://localhost:3000/api/users/avatar/${userStore.userId}`)
        if (response.ok) {
            const imageBlob = await response.blob()
            userStore.setAvatarImageData(imageBlob)
        }
        else {
            notificationStore.showNotification('Failed to fetch avatar', false)
        }
    }
    catch (error) {
        notificationStore.showNotification('Failed to fetch avatar: ' + error, false)
    }
}
