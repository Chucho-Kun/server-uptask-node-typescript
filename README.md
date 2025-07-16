# SERVER - REST API NODE - Typescrip ( MERN )
A server in Node that connects to an API in MongoDB - Node / Typescript Server - Express ( MERN )
## Technologies
Node + TypeScript + Mongoose + Express
Testing tests with Jest + Super Test
API documented by Swagger
## Developer Notes
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
