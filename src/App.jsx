import React, { useEffect, useState } from 'react'
import './App.css'
import { useGetUsersQuery } from './features/usersApiSlice'

function App() {
  const [notificationData, setNotificationData] = useState([])
  const [permission, setPermission] = useState('')
  const [support, setSupport] = useState(null)
  const { data } = useGetUsersQuery()

  useEffect(() => {
    /* Requisição inicial para status denied e default */
    if (Notification.permission === 'denied' || Notification.permission === 'default') {
      Notification.requestPermission()
    }
    /**
     * Usando PostMessage no Service Work(sw.js) permite passar os dados que estão em threads
     * para o cliente por meio do evento 'message'.
     */
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'push-notification') {
        setNotificationData((prevState) => [...prevState, { message: event.data.data }])
      }
    })
  }, [])

  /**
   * Permite checar se o navegador suportar Service Worker API e Push API.
   */
  const checkBrowserSupport = () => {
    if (!('serviceWorker' in navigator) && !('PushManager' in window)) {
      setSupport('Navegador incompativel.')
    } else {
      setSupport('Navegador possui requisitos necessários.')
    }
  }

  /**
   * Permite fazer requisição de permissão para o usuário por meio do Notification API.
   * Se o usuário recusar todas as solicitações, o navegador irá bloquear a requisição
   * para notificação até o usuário reiniciar o processo.
   */
  const requestNotificationPermission = async () => {
    const userPermission = await Notification.requestPermission()
    if (userPermission !== 'granted') {
      setPermission('Garanta permissão para utilizar site.')
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setSupport(null), 5000)
    return () => {
      clearTimeout(timer)
    }
  }, [support])

  useEffect(() => {
    const urlB64ToUint8Array = (base64String) => {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
      const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
      const rawData = self.atob(base64)
      const outputArray = new Uint8Array(rawData.length)
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
      }
      return outputArray
    }

    const saveSubscription = async (subscription) => {
      const SERVER_URL = 'http://127.0.0.1:3000/save-subscription'
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      })
      return response.json()
    }

    const registerServiceWorker = async () => {
      const swRegistration = await navigator.serviceWorker.register('sw.js')

      /*
      Verificar primeiro se o registro está instalado e ativo. Caso contrário,
      Erro: "Uncaught (in promise) DOMException: Subscription failed - no active Service Worker".
      */
      if (swRegistration.active) {
        try {
          const applicationServerKey = urlB64ToUint8Array(
            'BI9IyXomW2FnDoWgqKWEUn-t6mZDKZQA-nbsOUtw0LRwwRLgGkV0UG5KHa2DkWXNNzikNHWYok-dGRNIzjq-Ce8'
          )
          const options = { applicationServerKey, userVisibleOnly: true }
          const subscription = await swRegistration.pushManager.subscribe(options)
          const response = await saveSubscription(subscription)
          console.log(response)
        } catch (error) {
          console.log('SW: ', error)
        }
      }
      return swRegistration
    }

    const setupWorker = async () => {
      await registerServiceWorker()
      await requestNotificationPermission()
    }
    setupWorker()
  }, [])

  return (
    <div className="App">
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div>
          <button type="button" onClick={checkBrowserSupport}>
            Checar suporte
          </button>
          <button type="button" onClick={requestNotificationPermission}>
            Pedir Permissão
          </button>
        </div>
        <div>
          Notificações <span style={{ color: 'green' }}>{notificationData.length}</span>:{' '}
          {notificationData.map((notification) => {
            return <div style={{ color: 'red' }}>{notification.message}</div>
          })}
        </div>
      </div>
      <p>{support}</p>
      <p>{permission}</p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <h2>Nome</h2>
        <h2>Username</h2>
        <h2>Email</h2>
        <h2>Website</h2>
      </div>
      {data?.map((user) => {
        return (
          <div key={user.name}>
            <div
              style={{
                display: 'flex',
                gap: '1rem'
              }}
            >
              <div>{user.name}</div>
              <div style={{ flex: 1 }}>{user.username}</div>
              <div>{user.email}</div>
              <div>{user.website}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default App
