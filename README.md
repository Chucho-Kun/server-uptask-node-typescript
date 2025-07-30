# SERVER - REST API NODE - Typescrip ( MERN ) + JSON Web Token
A server in Node that connects to an API in MongoDB - Node / Typescript Server - Express ( MERN ) / Managed authentication with JWT
## Technologies
Node + TypeScript + Mongoose + Express
Testing tests with Jest + Super Test
API documented by Swagger
## Developer Notes
## Deploy on Render
Server hosted on render.com server
https://server-uptask-node-typescript.onrender.com/
### Mongo DB & Mongoose
![Gameplay A](src/assets/shot1.png)
### Login system
#### src/controllers/AuthController.ts
```
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
            
            const token = generateJWT({id: user.id})
            res.send(token)

        } catch (error) {     
            res.status(500).json({error:'Hubo un error en el servidor'})
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

    static user = async (req: Request , res: Response) => {
        return res.json(req.user)
    }

    static updateProfile = async (req: Request , res: Response) => {
        const { name , email } = req.body

        const userExist = await User.findOne({email})
        if(userExist && userExist.id.toString() !== req.user.id.toString()){
            return res.status(409).json({error:'Ese email ya está registrado'})
        }

        req.user.name = name
        req.user.email = email
        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static updateCurrentUserPassword = async (req: Request , res: Response) => {
        const { current_password , password } = req.body
        const user = await User.findById(req.user.id)
        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if(!isPasswordCorrect){
            return res.status(401).json({error:'El password actual es incorrecto'})
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('El password se modificó correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }
    
    static checkPassword = async (req: Request , res: Response) => {
        const { password } = req.body
        const user = await User.findById(req.user.id)
        const isPasswordCorrect = await checkPassword(password, user.password)
        
        if(!isPasswordCorrect){
            return res.status(401).json({error:'El password es incorrecto'})
        }
        res.send('Password correcto')
    }
}
```
#### src/routes/projectRoutes.ts
```
import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

router.use(authenticate)

router.post('/' , 
    body('projectName')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción es obligatoria'),
    handleInputErrors,
    ProjectController.createProject 
)

router.get('/' , ProjectController.getAllProjects )

router.get('/:id' , 
    param('id').isMongoId().withMessage('Id no válido'),
    handleInputErrors,        
    ProjectController.getProjectById 
)

/** Routes for task **/
router.param( 'projectId' , projectExist )

router.put('/:projectId' , 
    param('projectId').isMongoId().withMessage('Id no válido'),
    body('projectName')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción es obligatoria'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject 
)

router.delete('/:projectId' , 
    param('projectId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject 
)

router.post('/:projectId/task',
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatoria'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/task',
    handleInputErrors,
   TaskController.getProjectTasks
)

router.param( 'taskId' , taskExist )
router.param( 'taskId' , taskBelongsToProject )

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Id no válido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatoria'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('Id no válido'),
    body('status')
        .notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)
/** Routes for teams */
router.post('/:projectId/team/find' , 
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no válido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
    TeamMemberController.getProjectTeam
)

router.post('/:projectId/team' , 
    body('id')
        .isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId' ,
    param('userId')
        .isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

/** Routes for Notes */
router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El contenido es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    NoteController.deleteNote
)
export default router
```
### JSON Web Token
#### src/utils/jwt.ts
```
import jwt from "jsonwebtoken"
import { Types } from "mongoose"

type UserPayload = {
    id: Types.ObjectId
}

export const generateJWT = ( payload : UserPayload ) => {
 // expiresIn: 1d, 30s, 5m, 1y, 1h
    const token = jwt.sign( payload , process.env.JWT_SECRET , {
        expiresIn: '1d'
    } )
    return token
}
```
#### src/middleware/auth.ts
```
import { Request , Response , NextFunction, request } from "express"
import jwt from 'jsonwebtoken'
import User, { IUser } from "../models/User"

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async ( req:Request , res:Response , next:NextFunction) => {
    const bearer = req.headers.authorization
    
    if(!bearer){
        const error = new Error('No Autorizado')
        return res.status(401).json({error:error.message})
    }
    const token = bearer.split(' ')[1]

    try {
        const decoded = jwt.verify( token , process.env.JWT_SECRET )
        console.log({decoded});
        
        if(typeof decoded === 'object' && decoded.id){
            const user = await User.findById(decoded.id).select('_id name email')
            console.log(user);
            
            if(user){
                req.user = user
                next()
            }else{
                res.status(500).json({error:'Usuario no registrado'})
            }
        }
    } catch (error) {
        res.status(500).json({error:'Token no válido'})
    }

}
```
#### src/env
```
DATABASE_URL=mongodb+srv://root:xxx@xxx.xxx.mongodb.net/xxx
FRONTEND_URL=http://localhost:5173

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=xxxx
SMTP_USER=xxxx
SMTP_PASS=xxx

JWT_SECRET=xxxx
```
