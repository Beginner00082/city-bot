const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(), // <-- QUESTA È LA FIX
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote'
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
