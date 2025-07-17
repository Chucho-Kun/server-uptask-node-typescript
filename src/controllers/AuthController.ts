import type { Request , Response } from "express"
import User from "../models/User"
import { hashPassword } from "../utils/auth"

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

            //
            const user = new User( req.body )

            // Hash Password
            user.password = await hashPassword( password )
            await user.save()

            res.send('Cuenta creada, revisa tu email como confirmarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

}