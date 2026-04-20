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
let botPronto = false;

app.get('/', (req, res) => res.send('Bot WhatsApp attivo. Vai su /qr per vedere il QR'));

app.get('/qr', (req, res) => {
    if (botPronto) {
        return res.send(`<html><body style="background:#111;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;"><h1 style="color:#0f0;font-family:sans-serif;text-align:center;">BOT GIÀ CONNESSO ✅<br><br>Vai su WhatsApp e usa!help</h1></body></html>`);
    }
    if (!qrCodeImage) {
        return res.send(`<html><body style="background:#111;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;"><h1 style="color:white;font-family:sans-serif;text-align:center;">Generando QR...<br><br>Aggiorna tra 5 secondi</h1></body></html>`);
    }
    res.send(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111;margin:0;"><div style="text-align:center;"><h2 style="color:white;font-family:sans-serif;">Scansiona SUBITO</h2><img src="${qrCodeImage}" style="width:300px;height:300px;border:5px solid white;" /><p style="color:#888;font-family:sans-serif;">Scade in 20 sec.</p></div></body></html>`);
});

app.listen(PORT, () => console.log(`Server attivo su porta ${PORT}`));

const giochi = {};

async function startBot() {
    console.log('1. Avvio bot...');

    try {
        console.log('2. Carico Chromium...');
        const executablePath = await chromium.executablePath();
        console.log('3. Chromium path:', executablePath);

        const client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './wwebjs_auth',
                clientId: 'city-bot-1'
            }),
            puppeteer: {
                headless: chromium.headless,
                executablePath: executablePath,
                args: chromium.args
            },
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            }
        });

        client.on('qr', async (qr) => {
            if (botPronto) return;
            console.log('4. QR generato! Vai su /qr per vederlo');
            qrCodeImage = await QRCode.toDataURL(qr);
        });

        client.on('loading_screen', (percent, message) => {
            console.log('CARICAMENTO:', percent, message);
        });

        client.on('authenticated', () => {
            console.log('4.5 AUTENTICATO! Ora aspetto il ready...');
        });

        client.on('ready', () => {
            console.log('5. Bot connesso e pronto!');
            botPronto = true;
            qrCodeImage = null;
        });

        client.on('auth_failure', msg => {
            console.error('AUTH ERROR:', msg);
            botPronto = false;
        });

        client.on('disconnected', (reason) => {
            console.log('DISCONNESSO:', reason);
            botPronto = false;
        });

        client.on('message', async msg => {
            const chat = await msg.getChat();
            const testoRaw = msg.body;
            const testo = testoRaw.toLowerCase();
            const contatto = await msg.getContact();
            const nome = contatto.pushname || contatto.name || 'Player';

            console.log(`[DEBUG] Ricevuto: "${testoRaw}" | Pulito: "${testo}" | Da: ${nome}`);

            if (testo === '!help' || testo === '.help' || testo === '!comandi') {
                console.log('[DEBUG] Entro in HELP');
                chat.sendMessage(`🌆 *CITY BOT - COMANDI* 🌆

*!ping* - Controllo se sono vivo
*!bandiera* - Indovina la bandiera
*!gaymetro* - Scopri chi è gay 🌈
*!ciao* o *.ciao* - Saluta tutti

Scrivi il comando per usarlo!`);
            }

            if (testo === '!ping') {
                console.log('[DEBUG] Entro in PING');
                msg.reply('pong bro 🔥 Sono online!');
            }

            if (testo === '!ciao' || testo === '.ciao') {
                console.log('[DEBUG] Entro in CIAO');
                chat.sendMessage(`Ciao a tutti da City Bot! 🌆`);
            }

            if (testo === '!bandiera' || testo === '.bandiera') {
                console.log('[DEBUG] Entro in BANDIERA');
                const bandiere = [
                    { nome: 'italia', emoji: '🇮🇹' }, { nome: 'francia', emoji: '🇫🇷' },
                    { nome: 'germania', emoji: '🇩🇪' }, { nome: 'spagna', emoji: '🇪🇸' },
                    { nome: 'portogallo', emoji: '🇵🇹' }, { nome: 'brasile', emoji: '🇧🇷' },
                    { nome: 'argentina', emoji: '🇦🇷' }, { nome: 'giappone', emoji: '🇯🇵' },
                    { nome: 'cina', emoji: '🇨🇳' }, { nome: 'usa', emoji: '🇺🇸' },
                    { nome: 'canada', emoji: '🇨🇦' }, { nome: 'messico', emoji: '🇲🇽' },
                    { nome: 'regno unito', emoji: '🇬🇧' }, { nome: 'inghilterra', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
                    { nome: 'irlanda', emoji: '🇮🇪' }, { nome: 'olanda', emoji: '🇳🇱' },
                    { nome: 'belgio', emoji: '🇧🇪' }, { nome: 'svizzera', emoji: '🇨🇭' },
                    { nome: 'austria', emoji: '🇦🇹' }, { nome: 'svezia', emoji: '🇸🇪' },
                    { nome: 'norvegia', emoji: '🇳🇴' }, { nome: 'danimarca', emoji: '🇩🇰' },
                    { nome: 'finlandia', emoji: '🇫🇮' }, { nome: 'polonia', emoji: '🇵🇱' },
                    { nome: 'ucraina', emoji: '🇺🇦' }, { nome: 'russia', emoji: '🇷🇺' },
                    { nome: 'turchia', emoji: '🇹🇷' }, { nome: 'grecia', emoji: '🇬🇷' },
                    { nome: 'australia', emoji: '🇦🇺' }, { nome: 'india', emoji: '🇮🇳' },
                    { nome: 'corea del sud', emoji: '🇰🇷' }, { nome: 'egitto', emoji: '🇪🇬' }
                ];
                const scelta = bandiere[Math.floor(Math.random() * bandiere.length)];
                giochi[chat.id._serialized] = { tipo: 'bandiera', soluzione: scelta.nome };

                chat.sendMessage(`🏁 *INDOVINA LA BANDIERA* 🏁

Di che nazione è questa bandiera?
${scelta.emoji}

Scrivi il nome della nazione per rispondere!`);
            }

            if (giochi[chat.id._serialized]?.tipo === 'bandiera') {
                if (testo === giochi[chat.id._serialized].soluzione) {
                    console.log('[DEBUG] BANDIERA CORRETTA');
                    chat.sendMessage(`🎉 *CORRETTO!* 🎉

${nome} ha indovinato! Era ${giochi[chat.id._serialized].soluzione.toUpperCase()}.
Scrivi *!bandiera* per un'altra!`);
                    delete giochi[chat.id._serialized];
                }
            }

            if (testo === '!gaymetro' || testo === '.gaymetro') {
                console.log('[DEBUG] Entro in GAYMETRO');
                if (!chat.isGroup) {
                    return chat.sendMessage('Il!gaymetro funziona solo nei gruppi bro 😂');
                }

                const partecipanti = chat.participants;
                const vittima = partecipanti[Math.floor(Math.random() * partecipanti.length)];
                const percentuale = Math.floor(Math.random() * 101);
                const contattoVittima = await client.getContactById(vittima.id._serialized);
                const tag = `@${vittima.id.user}`;

                chat.sendMessage(`🌈 *GAYMETRO ATTIVATO* 🌈

La gaymetro ha analizzato il gruppo...

${tag} è gay al *${percentuale}%* 🏳️‍🌈`, {
                    mentions: [contattoVittima]
                });
            }
        });

        console.log('6. Inizializzo client...');
        await client.initialize();

    } catch (error) {
        console.error('ERRORE FATALE NEL TRY:', error);
        process.exit(1);
    }
}

startBot();
