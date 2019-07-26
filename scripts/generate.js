const fs = require('fs')
const webpush = require('web-push')

const vapidKeys = webpush.generateVAPIDKeys()

const template = `
VAPID_PUBLIC=${vapidKeys.publicKey}
VAPID_PRIVATE=${vapidKeys.privateKey}
`

fs.writeFile('.env', template, 'utf8', (err) => {
  if (err) {
    throw err
  }
  console.log('Env file generated !')
})
