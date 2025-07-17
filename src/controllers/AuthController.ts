import type { Request , Response } from "express"
import User from "../models/User"
import { hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { transporter } from "../config/nodemailer"
import { AuthEmail } from "../emails/AuthEmail"

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
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })
            
            await Promise.allSettled([ user.save() , token.save() ])

            res.send('Cuenta creada, revisa tu email como confirmarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async ( req: Request , res: Response ) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token expirado')
                return res.status(404).json({error: error.message})
            }
            const user = await User.findById(tokenExist.user)
            user.confirmed = true

            await Promise.allSettled([ user.save() , tokenExist.deleteOne() ])
            res.send('Cuenta confirmada correctamente')

        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }

}