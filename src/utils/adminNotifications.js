import { toast } from 'react-toastify'

let originalTitle = document.title
let flashing = false

export function showToastNotification() {
  toast.info('New Official Business Request Submitted')
}

export function sendSystemNotification() {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('New Official Business Request', {
        body: 'A new request has been submitted.',
        icon: '/notification-icon.png'
      })
    }
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission()
  }
}

export function flashTabTitle() {
  if (document.hidden && !flashing) {
    originalTitle = document.title
    flashing = true
    document.title = '(1) New Request!'
  }
}

export function resetTabTitle() {
  flashing = false
  document.title = originalTitle
}
