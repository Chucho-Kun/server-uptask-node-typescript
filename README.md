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

export type ProyectType = Document & {
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

const Project = mongoose.model<ProyectType>( 'Project' , ProjectSchema )
export default Project
```
#### src/models/Task.ts
```
import mongoose, { Schema , Document, Types } from "mongoose";

export interface ITask extends Document {
    name: string
    description: string
    project: Types.ObjectId
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
    }
} , { timestamps : true })

const Task = mongoose.model<ITask>('Task' , TaskSchema)
export default Task
```
