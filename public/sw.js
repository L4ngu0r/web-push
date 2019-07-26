self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.text() : 'no payload'
  console.log('payload', payload)
  event.waitUntil(
    self.clients.matchAll()
      .then((clients) => {
        const focused = clients.some(c => c.focused)
        if (focused) {
          console.log('you are focused !')
        } else if (clients.length) {
          console.log('You need to focus')
        } else {
          console.log('page closed')
        }

        clients.forEach((c) => {
          c.postMessage({ payload })
        })

        return Promise.resolve()
      })
  )
})
