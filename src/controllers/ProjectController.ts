import type { Request , Response } from "express"
import Project from "../models/Project"

export class ProjectController {

    static createProject = async ( req : Request , res : Response ) => {
        
        const project = new Project( req.body )

        //Asigna un manager
        project.manager = req.user.id
        
        try {
            await project.save()
            res.send('proyecto creado correctamente...')
        } catch (error) {
            console.log(error);
        } 
    }
    
    static getAllProjects = async ( req : Request , res : Response ) => {       
        
        try {
            console.log('vamos a comprobar');
            
            const projects = await Project.find({
                $or:[{
                    manager: {$in: req.user.id}
                }]
            }).populate('tasks')
            res.json(projects)
        } catch (error) {
            console.log(error);
            res.status(500).json({error:'Error al obtener los proyectos'})
        }   
    }

    static getProjectById = async ( req : Request , res : Response ) => {
        const { id } = req.params
        try {
            const project = await Project.findById( id ).populate('tasks')
            
            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }

            if(project.manager.toString() !== req.user.id.toString()){ return res.status(404).json({error:'Acción no válida'})}
            
            res.json(project)
        } catch (error) {
            console.log(error);
            
        }   
    }

    static updateProject = async ( req : Request , res : Response ) => {
        const { id } = req.params
        try {
            const project = await Project.findById( id )
            if( !project ){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }

            if(project.manager.toString() !== req.user.id.toString()){ return res.status(404).json({error:'Solo el manager puede actualizar el proyecto'})}

            project.clientName = req.body.clientName
            project.projectName = req.body.projectName
            project.description = req.body.description
            
            await project.save()
            res.send('Proyecto actualizado')
            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }
            
            res.json(project)
        } catch (error) {
            console.log(error);
            
        }   
    }

    static deleteProject = async ( req : Request , res : Response ) => {
        const { id } = req.params
        try {
            const project = await Project.findById( id )

            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }

            if(project.manager.toString() !== req.user.id.toString()){ return res.status(404).json({error:'Solo el manager puede eliminar el proyecto'})}

            await project.deleteOne()
            res.send('Proyecto eliminado')
        } catch (error) {
            console.log(error);
            
        }   
    }

}