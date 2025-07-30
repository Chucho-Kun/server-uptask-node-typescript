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
                        html: `<div style="text-align: center;">
                                    <div style="text-align: center;font-weight: bold;background-color: #efefef;color: gray;padding: 15px 0px;border-radius: 8px;font-family: sans-serif;max-width: 600px;display: inline-block;width: 100%;">
                                    <p style="font-size: 23px;">${ user.name }</p>
                                    <p>Confirma tu registro</p>
                                                                <div>
                                                                <p>Solo se requiere confirmar la cuenta en la siguiente liga</p>
                                                                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                                                                <p>Ingresa el código<p><b style="
                                    font-size: 27px;
                                ">${ user.token }</b></p></p>
                                                                <p style="font-style: italic;max-width: 300px;display: inline-block;color: black;">El token tiene una caducidad de 10 minutos desde que se envía al correo</p>
                                                                </div>
                                                                </div></div>
                                `
                    })
                    
                    
    }

    static sendPasswordResetToken = async ( user : IEmail ) => {
        const info = await transporter.sendMail({
                        from: 'UpTask <admin@uptask.com>',
                        to: user.email,
                        subject: 'UpTask - Restablecer Password',
                        text: 'Restablece tu password de UpTask desde este email',
                        html: `<div style="text-align: center;">
                                    <div style="text-align: center;font-weight: bold;background-color: #efefef;color: gray;padding: 15px 0px;border-radius: 8px;font-family: sans-serif;max-width: 600px;display: inline-block;width: 100%;">
                                <p style="font-size: 23px;">${ user.name }</p>
                                <p>Solicitaste restablecer tu password</p>
                                                                <div>
                                                                <p>Visita el siguiente enlace:</p>
                                                                <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer Password</a>
                                                                <p>Ingresa el código<p><b style="font-size: 27px;">${ user.token }</b></p></p>
                                                                <p style="font-style: italic;max-width: 300px;display: inline-block;color: black;
                                ">El token tiene una caducidad de 10 minutos desde que se envía al correo</p>
                                                                </div>
                                                                </div></div>`
                                
                    })
                    
                    
    }

}