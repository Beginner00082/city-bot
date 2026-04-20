const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
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

client.initialize();
