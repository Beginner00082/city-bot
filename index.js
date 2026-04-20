const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chromium = require('@sparticuz/chromium');

async function startBot() {
    console.log('1. Avvio bot...');
    
    try {
        console.log('2. Carico Chromium...');
        const executablePath = await chromium.executablePath();
        console.log('3. Chromium path:', executablePath);

        const client = new Client({
            authStrategy: new LocalAuth({ dataPath: './wwebjs_auth' }),
            puppeteer: {
                headless: chromium.headless,
                args: chromium.args,
                executablePath: executablePath,
                defaultViewport: chromium.defaultViewport
            }
        });

        client.on('qr', (qr) => {
            console.log('4. Client ready! Scan this QR:');
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => {
            console.log('5. Bot connesso e pronto!');
        });

        client.on('auth_failure', msg => {
            console.error('AUTH ERROR:', msg);
        });

        client.on('disconnected', (reason) => {
            console.log('DISCONNESSO:', reason);
        });

        console.log('6. Inizializzo client...');
        await client.initialize();

    } catch (error) {
        console.error('ERRORE FATALE:', error);
        process.exit(1);
    }
}

startBot();
