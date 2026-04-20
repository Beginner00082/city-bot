const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')
const qrcode = require('qrcode-terminal')
const fs = require('fs')

// DATABASE PUNTI SEMPLICE
let punti = {}
if (fs.existsSync('./punti.json')) {
    punti = JSON.parse(fs.readFileSync('./punti.json'))
}

function salvaPunti() {
    fs.writeFileSync('./punti.json', JSON.stringify(punti, null, 2))
}

// GIOCO IN CORSO - per bloccare spam
let giocoAttivo = null

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sessione')

    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        if(qr) {
            console.log('SCANSIONA IL QR BRO:')
            qrcode.generate(qr, {small: true})
        }
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode!== DisconnectReason.loggedOut
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('O CITY E GUARDIOL BOT È ONLINE 🔥')
        }
    })

    // ASCOLTA MESSAGGI
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if(!m.message || m.key.fromMe) return

        const testo = m.message.conversation || m.message.extendedTextMessage?.text || ''
        const chat = m.key.remoteJid
        const mittente = m.key.participant || m.key.remoteJid
        const nomeMittente = m.pushName || 'Fratè'

        // COMANDO.MENU
        if(testo.toLowerCase() === '.menu') {
            await sock.sendMessage(chat, {
                text: `*O CITY E GUARDIOL BOT* 🔥\n\n*🎮 GIOCHI*\n.bandiera → Indovina la nazione\n.cibo → Indovina il piatto\n.giocatore → Indovina il player\n\n*📊 METRI*\nRispondi a qualcuno e usa:\n.gaymetro\n.bellometro\n.lesbiometro\n.masturbometro\n.intelligiometro\n\n*🏆 CLASSIFICA*\n.punti → Vedi i tuoi punti\n.top → Top 3 giocatori\n\n*Tvtttb guerrieri* ❤️`
            })
        }
    })
}

startBot()<

