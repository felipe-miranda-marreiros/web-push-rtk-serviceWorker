import express, { json, urlencoded } from 'express'
import cors from 'cors'
import webpush from 'web-push'

const app = express()
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))

const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

const dummyDb = { subscription: null }

const saveToDatabase = async (subscription) => {
  dummyDb.subscription = subscription
}

app.post('/save-subscription', async (req, res) => {
  const subscription = req.body
  console.log(subscription)
  await saveToDatabase(subscription)
  res.json({ message: 'success' })
})

const vapidKeys = {
  publicKey:
    'BI9IyXomW2FnDoWgqKWEUn-t6mZDKZQA-nbsOUtw0LRwwRLgGkV0UG5KHa2DkWXNNzikNHWYok-dGRNIzjq-Ce8',
  privateKey: 'PzPOqeMONwCeKIoTEC5NfkKCSwnhO_Izf5aTUDdjUOA'
}

webpush.setVapidDetails(
  'mailto:myuserid@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

const sedNotification = (subscription, dataToSend = '') => {
  if (subscription === null) {
    console.log('no sub')
  } else {
    webpush.sendNotification(subscription, dataToSend)
  }
}

app.get('/send-notification', (req, res) => {
  const subscription = dummyDb.subscription
  const message = 'Hello World'
  sedNotification(subscription, message)
  res.json({ message: 'message sent' })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
