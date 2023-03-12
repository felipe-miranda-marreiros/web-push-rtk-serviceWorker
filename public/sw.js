/**
 * Evento que permite receber a notificação do back-end para o cliente.
 *  Usa PostMessage para enviar dados do Service Worker para o navegador.
 */
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.text()
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'push-notification', data })
      })
    })
    self.registration.showNotification('Oi', {
      body: data
    })
  } else {
    console.log('Sem resposta')
  }
})
