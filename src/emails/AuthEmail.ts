import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {

    static sendConfirmationEmail = async ( user : IEmail ) => {
        const info = await transporter.sendMail({
                        from: 'UpTask <admin@uptask.com>',
                        to: user.email,
                        subject: 'UpTask - Confirmar Cuenta',
                        text: 'Puedes confirmar tu cuenta de UpTask en este email',
                        html: `<div style="text-align: center;
                                font-weight: bold;
                                background-color: darkblue;
                                color: white;
                                padding: 15px 0px;
                                border-radius: 8px;
                                font-family: sans-serif;">${ user.name } Confirma tu registro
                                <div>
                                <p>Solo se requiere confirmar la cuenta en la siguiente liga</p>
                                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                                <p>Ingresa el código: <b>${ user.token }</b></p>
                                <p>El token tiene una caducidad de 10 minutos desde que se envía al correo</b></p>
                                </div>
                                </div>
                                `
                    })
                    console.log('Mensaje enviado' , info.messageId);
                    
    }

}