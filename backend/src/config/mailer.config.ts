import * as nodemailer from 'nodemailer';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env.development'});

export const email = 'Informes@cafelaesmeralda.com.ar';

const transporter = nodemailer.createTransport({
    host: 'mxout3.hostingtelefonica.com.ar',
    port: 25,
    secure: false,
    auth: {
        user: email,
        pass: process.env.PASS_EMAIL
    }
})

export default transporter;