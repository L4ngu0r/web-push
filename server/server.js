
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParse = require('body-parser')
const webPush = require('web-push')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID

const url = 'mongodb://localhost:27017'
const dbName = 'nebo'

async function connectDb () {
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  if (!client) {
    throw new Error('No mongo client !')
  }
  return client
}

async function register (sub) {
  console.log(sub)
  const client = await connectDb()
  try {
    const db = await client.db(dbName)
    const collection = db.collection('devices')
    if (sub.id) {
      const found = await collection.findOne(new ObjectId(sub.id))
      if (found) {
        return null
      }
    }
    const insert = await collection.insertOne(sub)
    return insert.insertedId
  } catch (error) {
    console.error(error)
  } finally {
    console.log('close connection')
    client.close()
  }
}

async function getSubscription (id) {
  const client = await connectDb()
  try {
    const db = await client.db(dbName)
    const collection = db.collection('devices')
    const found = await collection.findOne(new ObjectId(id))
    console.log(found)
    return found
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
}

async function deleteSubscription (id) {
  const client = await connectDb()
  try {
    const db = await client.db(dbName)
    const collection = db.collection('devices')
    return collection.deleteOne(new ObjectId(id))
  } catch (error) {
    console.error(error)
  } finally {
    client.close()
  }
}

app.use(bodyParse.json())
app.use(cors())

require('dotenv').config()

webPush.setVapidDetails(
  'http://localhost:3000',
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
)

app.get('/publickey', (req, res) => {
  res.send(process.env.VAPID_PUBLIC)
})

app.post('/register', async (req, res) => {
  const id = await register(req.body)
  console.log('id', id)
  if (!id) {
    res.sendStatus(200)
  } else {
    res.status(201).send({ id })
  }
})

app.post('/unregister', async (req, res) => {
  const deleted = await deleteSubscription(req.body.id)
  if (deleted.acknowledged) {
    res.sendStatus(200)
  } else {
    res.status(404).send({ id: req.body.id })
  }
})

app.post('/sendNotification', async (req, res) => {
  console.log(req.body)
  const subscription = await getSubscription(req.body.id)
  const payload = req.body.payload
  const options = {
    TTL: req.body.ttl
  }

  setTimeout(() => {
    webPush.sendNotification(subscription.subscription, payload, options)
      .then(() => {
        res.sendStatus(201)
      })
      .catch((error) => {
        res.sendStatus(500)
        console.log(error)
      })
  }, req.body.delay * 1000)
})

app.listen(4000, () => {
  console.log('Server listening on port 4000!')
})
