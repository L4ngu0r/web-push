function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

document.getElementById('send').addEventListener('click', () => {
  fetch('http://localhost:4000/sendNotification', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      id: localStorage.getItem('registerId'),
      payload: 'test',
      delay: 5,
      ttl: 0
    })
  })
})

document.getElementById('unregister').addEventListener('click', async () => {
  const response = await fetch('http://localhost:4000/unregister', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ id: localStorage.getItem('registeredId') })
  })
  if (response.ok) {
    localStorage.removeItem('registeredId')
  }
})

navigator.serviceWorker.register('sw.js')

navigator.serviceWorker.ready
  .then((registration) => {
    navigator.serviceWorker.onmessage = (e) => {
      // TODO display custom notif !
      console.log(e)
    }

    return registration.pushManager.getSubscription()
      .then(async (subscription) => {
        if (subscription) {
          return subscription
        }

        // Get the server's public key
        const response = await fetch('http://localhost:4000/publicKey')
        const vapidPublicKey = await response.text()
        // Chrome doesn't accept the base64-encoded (string) vapidPublicKey yet
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

        return registration.pushManager.subscribe({
          applicationServerKey: convertedVapidKey
        })
      })
      .catch(err => console.error(err))
  }).then(async (subscription) => {
    const previousId = localStorage.getItem('registerId')

    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        id: previousId,
        subscription: subscription
      })
    })
    if (response.status === 201) {
      const json = await response.json()
      if (json.id) {
        console.log(`Registered with id : ${json.id}`)
        localStorage.setItem('registerId', json.id)
      }
    }
  })
  .catch(err => console.error(err))
