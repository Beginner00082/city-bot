const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chromium = require('@sparticuz/chromium');

async function startBot() {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: chromium.headless,
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            defaultViewport: chromium.defaultViewport
        }
    });

    client.on('qr', (qr) => {
        console.log('Client ready! Scan this QR:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Bot connesso e pronto!');
    });

    client.on('message', msg => {
        if (msg.body === '!ping') {
            msg.reply('pong 🏓');
        }
    });

    await client.initialize();
}

startBot();
