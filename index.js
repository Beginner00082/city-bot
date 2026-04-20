process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED ERROR:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT ERROR:', error);
    process.exit(1);
});

// AGGIUNGI QUESTE 5 RIGHE PER NON FARLO MORIRE
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot WhatsApp attivo'));
app.listen(PORT, () => console.log(`Server fake attivo su porta ${PORT}`));

const { Client, LocalAuth } = require('whatsapp-web.js');

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
                    '--disable-software-rasterizer',
                    '--disable-features=site-per-process'
                ]
            }
        });

        client.on('qr', (qr) => {
            console.log('4. Client ready! QR grezzo:');
            console.log('COPIA_QR_INIZIO');
            console.log(qr);
            console.log('COPIA_QR_FINE');
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
