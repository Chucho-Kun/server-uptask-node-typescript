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
            res.status(500).json({error:'Hubo un error al crear el proyecto'})
        } 
    }
    
    static getAllProjects = async ( req : Request , res : Response ) => {       
        
        try {
            
            const projects = await Project.find({
                $or:[
                    {manager: {$in: req.user.id}},
                    {team:{$in: req.user.id}}
                ]
            }).populate('tasks')
            res.json(projects)
        } catch (error) {
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

            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)){ 
                return res.status(404).json({error:'Acción no válida'})
            }
            
            res.json(project)
        } catch (error) {
            res.status(500).json({error:'Hubo un error al obtener proyectos por id'})
        }   
    }

    static updateProject = async ( req : Request , res : Response ) => {
        try {
            req.project.clientName = req.body.clientName
            req.project.projectName = req.body.projectName
            req.project.description = req.body.description
            
            await req.project.save()
            res.send('Proyecto actualizado')
            if(!req.project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({ error: error.message })
            }
            
            res.json(req.project)
        } catch (error) {
            res.status(500).json({error:'Hubo un error al actualizar el proyecto'})
        }   
    }

    static deleteProject = async ( req : Request , res : Response ) => {
        try{
            await req.project.deleteOne()
            res.send('Proyecto eliminado')
        } catch (error) {
            res.status(500).json({error:'Hubo un error al borrar el proyecto'})
        }   
    }

}