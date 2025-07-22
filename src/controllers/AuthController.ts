import type { Request , Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { transporter } from "../config/nodemailer"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

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

            res.send('Cuenta creada, revisa tu email para confirmarla')
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

    static login = async ( req: Request , res: Response ) => {
        try {

            // Verificar usuario registrado
            
            const { email , password } = req.body
            const user = await User.findOne({email})

            if(!user){
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error:error.message})
            }
            /** Verificar que el usuario haya confirmado su cuenta, si no, mandar correo de confirmación
            if(!user.confirmed){
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // enviar el email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada, se ha enviado un nuevo email de confirmación')
                return res.status(404).json({error: error.message})
            }
             */

            // Revisar Password

            const isPasswordCorrect = await checkPassword( password , user.password )
            if( !isPasswordCorrect ){
                const error = new Error('Password incorrecto!')
                return res.status(401).json({error: error.message})
            }
            const token = generateJWT(user.id)
            console.log(token);
            
            res.send('auteticado...')

        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }

    static requestConfirmationCode = async ( req : Request , res : Response ) => {
        try {
            const { email } = req.body

            // Comprobar correo registrado para enviar el correo de confirmación
            const user = await User.findOne({email})
            if( !user ){
                const error = new Error('Usuario no registrado')
                res.status(404).json({error: error.message})
            }

            if( user.confirmed ){
                const error = new Error('El usuario ya está confirmado')
                return res.status(403).json({ error: error.message})
            }
            
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

            res.send(`Se envió un nuevo token a tu correo: ${ email }`)
        } catch (error) {
            res.status(500).json({error: 'Error mientras se enviaba un nuevo token al correo registrado'})
        }
    }

    static forgottenPassword = async ( req : Request , res : Response ) => {
        try {
            const { email } = req.body

            // Comprobar correo registrado para enviar el correo de confirmación
            const user = await User.findOne({email})
            if( !user ){
                const error = new Error('Usuario no registrado')
                res.status(404).json({error: error.message})
            }
            
            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // enviar el email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send(`Se envió la liga de restauración al email: ${ email }`)
        } catch (error) {
            res.status(500).json({error: 'Error mientras se enviaba un nuevo token al correo registrado'})
        }
    }

    static validateToken = async ( req: Request , res: Response ) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token expirado')
                return res.status(404).json({error: error.message})
            }
            res.send('Token válido, Asigna un nuevo password')
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }

    static uptadePasswordWithToken = async ( req: Request , res: Response ) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save() , tokenExist.deleteOne()])

            res.send('Password modificado correctamente')
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }

}