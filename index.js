process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED ERROR:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT ERROR:', error);
    process.exit(1);
});

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
                executablePath: executablePath,
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--single-process'
                ]
            }
        });

        client.on('qr', (qr) => {
            console.log('4. Client ready! Scan this QR:');
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => {
            console.log('5. Bot connesso e pronto!');
        });

        console.log('6. Inizializzo client...');
        await client.initialize();

    } catch (error) {
        console.error('ERRORE FATALE NEL TRY:', error);
        process.exit(1);
    }
}

startBot();
