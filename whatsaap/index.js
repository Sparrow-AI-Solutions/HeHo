const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const fetch = require('node-fetch')

const HEHO_API = process.env.HEHO_API
const HEHO_API_KEY = process.env.HEHO_API_KEY
const CHATBOT_ID = process.env.CHATBOT_ID

if (!HEHO_API || !HEHO_API_KEY || !CHATBOT_ID) {
  console.error('Missing env vars. Required: HEHO_API, HEHO_API_KEY, CHATBOT_ID')
  process.exit(1)
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
})

async function notifyDeployed() {
  await fetch(`${HEHO_API}/whatsapp/deployed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatbot_id: CHATBOT_ID })
  })
}

client.on('qr', async (qr) => {
  qrcode.generate(qr, { small: true })
  await fetch(`${HEHO_API}/whatsapp/qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatbot_id: CHATBOT_ID, qr })
  })
})

client.on('ready', async () => {
  console.log('WhatsApp connected ✅')
  await fetch(`${HEHO_API}/whatsapp/connected`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatbot_id: CHATBOT_ID, status: 'connected' })
  })
})

client.on('message', async (msg) => {
  try {
    const response = await fetch(`${HEHO_API}/aichat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HEHO_API_KEY}`
      },
      body: JSON.stringify({
        chatbotId: CHATBOT_ID,
        messages: [{ role: 'user', content: msg.body }],
        history: []
      })
    })

    const data = await response.json()
    await msg.reply(data.reply || data.message || 'I got your message.')
  } catch (error) {
    console.error('Message handling error:', error)
    await msg.reply('Sorry, something went wrong while contacting HeHo API.')
  }
})

client.initialize()
notifyDeployed()
