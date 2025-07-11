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