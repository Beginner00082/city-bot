process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED ERROR:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT ERROR:', error);
    process.exit(1);
});

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode'); // CAMBIATO LIBRERIA

let chromium;
(async () => {
    chromium = await import('@sparticuz/chromium');
    startBot();
})();

async function startBot() {
    console.log('1. Avvio bot...');
    
    try {
        console.log('2. Carico Chromium...');
        const executablePath = await chromium.default.executablePath();
        console.log('3. Chromium path:', executablePath);

        const client = new Client({
            authStrategy: new LocalAuth({ dataPath: './wwebjs_auth' }),
            puppeteer: {
                headless: chromium.default.headless,
                executablePath: executablePath,
                args: [
                    ...chromium.default.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--single-process',
                    '--no-zygote',
                    '--disable-extensions',
                    '--disable-software-rasterizer'
                ]
            }
        });

        client.on('qr', async (qr) => {
            console.log('4. Client ready! QR generato.');
            // Genera un link con l'immagine del QR
            const qrImageUrl = await qrcode.toDataURL(qr);
            console.log('APRI QUESTO LINK PER VEDERE IL QR:');
            console.log(qrImageUrl); // QUESTO È UN LINK LUNGHISSIMO
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
        console.error('ERRORE FATALE NEL TRY:', error);
        process.exit(1);
    }
                    }
