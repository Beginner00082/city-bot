process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED ERROR:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT ERROR:', error);
    process.exit(1);
});

const express = require('express');
const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const chromium = require('@sparticuz/chromium');

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeImage = null;

app.get('/', (req, res) => res.send('Bot WhatsApp attivo. Vai su /qr per vedere il QR'));

app.get('/qr', (req, res) => {
    if (!qrCodeImage) {
        return res.send(`
            <html>
                <body style="background:#111;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
                    <h1 style="color:white;font-family:sans-serif;text-align:center;">
                        QR non ancora generato<br><br>
                        Aggiorna questa pagina tra 10 secondi
                    </h1>
                </body>
            </html>
        `);
    }
    res.send(`
        <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111;margin:0;">
                <div style="text-align:center;">
                    <h2 style="color:white;font-family:sans-serif;">Scansiona SUBITO con WhatsApp</h2>
                    <img src="${qrCodeImage}" style="width:300px;height:300px;border:5px solid white;" />
                    <p style="color:#888;font-family:sans-serif;">Il QR scade in 20 secondi. Se non va, aggiorna la pagina.</p>
                </div>
            </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Server attivo su porta ${PORT}`));

async function startBot() {
    console.log('1. Avvio bot...');
    
    try {
        console.log('2. Carico Chromium...');
        const executablePath = await chromium.executablePath();
        console.log('3. Chromium path:', executablePath);

        const client = new Client({
            authStrategy: new LocalAuth({ 
                dataPath: './wwebjs_auth',
                clientId: 'mio-bot-render-1'
            }),
            puppeteer: {
                headless: chromium.headless,
                executablePath: executablePath,
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--single-process',
                    '--no-zygote'
                ]
            }
        });

        client.on('qr', async (qr) => {
            console.log('4. QR generato! Vai su /qr per vederlo');
            qrCodeImage = await QRCode.toDataURL(qr);
        });

        client.on('ready', () => {
            console.log('5. Bot connesso e pronto!');
            qrCodeImage = null;
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

startBot();
