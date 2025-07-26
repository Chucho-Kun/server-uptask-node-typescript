# SERVER - REST API NODE - Typescrip ( MERN ) + JSON Web Token
A server in Node that connects to an API in MongoDB - Node / Typescript Server - Express ( MERN ) / Managed authentication with JWT
## Technologies
Node + TypeScript + Mongoose + Express
Testing tests with Jest + Super Test
API documented by Swagger
## Developer Notes
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
            res.send('auteticado...')

        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }

}
```
#### src/models/Project.ts
```
import mongoose, { Document, PopulatedDoc, ProjectionType, Schema, Types } from "mongoose";
import { ITask } from "./Task";

export interface IProject extends Document {
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<ITask & Document>[]
}

const ProjectSchema : Schema = new Schema({
    projectName: {
        type: String,
        require: true,
        trim: true
    },
    clientName: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        require: true,
        trim: true
    },
    tasks: [{
        type: Types.ObjectId,
        ref: 'Task'
    }]
}, { timestamps : true })

const Project = mongoose.model<IProject>( 'Project' , ProjectSchema )
export default Project
```
#### src/models/Task.ts
```
import mongoose, { Schema , Document, Types } from "mongoose";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const

export type TaskStatus = typeof taskStatus[ keyof typeof taskStatus ]

export interface ITask extends Document {
    name: string
    description: string
    project: Types.ObjectId
    status: TaskStatus
}

export const TaskSchema : Schema = new Schema({
    name: {
        type: String,
        trim: true,
        require: true
    },
    description:{
        type: String,
        trim: true,
        require: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: Object.values( taskStatus ),
        default: taskStatus.PENDING
    }
} , { timestamps : true })

const Task = mongoose.model<ITask>('Task' , TaskSchema)
export default Task
```
#### src/models/User.ts
```
import mongoose, { Schema , Document } from "mongoose"

export interface IUser extends Document {
    email: string
    password: string
    name: string
    confirmed: boolean
}

const userSchema : Schema = new Schema({
    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    confirmed:{
        type: Boolean,
        default: false
    }
})

const User = mongoose.model<IUser>('User' , userSchema)
export default User
```
#### src/routes/projectRoutes.ts
```
import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import { taskBelongsToProject, taskExist } from "../middleware/task";

const router = Router()

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

router.put('/:id' , 
    param('id').isMongoId().withMessage('Id no válido'),
    body('projectName')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción es obligatoria'),
    handleInputErrors,    
    ProjectController.updateProject 
)

router.delete('/:id' , 
    param('id').isMongoId().withMessage('Id no válido'),
    handleInputErrors,        
    ProjectController.deleteProject 
)

/** Routes for task **/
router.param( 'projectId' , projectExist )

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
    param('taskId').isMongoId().withMessage('Id no válido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatoria'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
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

export default router
```
#### src/routes/projectRoutes.ts
```
import colors from "colors"
import server from "./server"

const port = process.env.PORT || 4000

server.listen( port , () => {
    console.log( colors.bgBlue.bold( `escuchando en el puerto ${ port }` ));
    
})
```
#### .env
```
DATABASE_URL=mongodb+srv://root:xxxxx@xxxxx.xxxxx.mongodb.net/uptask_mern
FRONTEND_URL=https://client-uptask-node-typescript.vercel.app
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
#### src/models/Note.ts
```
import mongoose, { Document, Schema, Types } from "mongoose";

export interface INote extends Document {
    content: string
    createdBy: Types.ObjectId
    task: Types.ObjectId
}

const NoteSchema: Schema = new Schema({
    content:{
        type: String,
        required: true
    },
    createdBy:{
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    task:{
        type: Types.ObjectId,
        ref: 'Task',
        required:true
    }

},{timestamps: true})

const Note = mongoose.model<INote>('Note', NoteSchema)
export default Note
```
