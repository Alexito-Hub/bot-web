require('dotenv').config();
const fs = require("fs")
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, LegacySessionAuth } = require("whatsapp-web.js");

const SESSION_FILE_PATH = "./session.json";
const country_code = process.env.COUNTRY_CODE;
const number = process.env.NUMBER;
const msg = process.env.MSG;

let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

const auth = sessionData ? new LegacySessionAuth(sessionData) : new LocalAuth();

const client = new Client({
    auth: auth,
});

client.on("qr", (qr) => {
    console.log("Escanea el siguiente código QR con tu aplicación WhatsApp:");
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", (session) => {
    sessionData = session;
    if (session) {
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("Datos de sesión guardados con éxito");
            }
        });
    }
    console.log("Autenticado con éxito");
});

client.on("auth_failure", msg => {
    console.error('FALLO EN LA AUTENTICACIÓN', msg);
})

client.on("ready", () => {
    console.log("Cliente listo para enviar mensajes.");

    let chatId = `${country_code}${number}@c.us`;
    client.sendMessage(chatId, msg).then((response) => {
        if (response.id.fromMe) {
            console.log("¡Funciona!");
        }
    });
});

client.on("message", message => {
    if (message.body === "Hello") {
        client.sendMessage(message.from, 'World!');
    }
});

client.initialize();
