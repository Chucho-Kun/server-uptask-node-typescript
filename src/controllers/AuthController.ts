import type { Request , Response } from "express"
import User from "../models/User"
import { hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { transporter } from "../config/nodemailer"

export class AuthController {

    static createAccount = async ( req : Request , res : Response ) => {
        try {
            const { password , email } = req.body

            // Manejo de error en correos ya existentes
            const userExist = await User.findOne({email})
            if( userExist ){
                const error = new Error('Usuario ya registrado')
                res.status(409).json({error: error.message})
            }

            // Crear usuario
            const user = new User( req.body )

            // Hash Password
            user.password = await hashPassword( password )
            
            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // enviar el email
            await transporter.sendMail({
                from: 'UpTask <admin@uptask.com>',
                to: user.email,
                subject: 'UpTask - Confirmar Cuenta',
                text: 'Puedes confirmar tu cuenta de UpTask en este email',
                html: `<p style="text-align: center;
                        font-weight: bold;
                        background-color: darkblue;
                        color: white;
                        padding: 15px 0px;
                        border-radius: 8px;
                        font-family: sans-serif;">${ user.name } Confirma tu registro</p>`
            })
            
            await Promise.allSettled([ user.save() , token.save() ])

            res.send('Cuenta creada, revisa tu email como confirmarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

}