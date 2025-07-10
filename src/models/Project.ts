import mongoose, { Document, ProjectionType, Schema } from "mongoose";

export type ProyectType = Document & {
    projectName: string
    clientName: string
    description: string
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
    }
})

const Project = mongoose.model<ProjectionType>( 'Project' , ProjectSchema )
export default Project