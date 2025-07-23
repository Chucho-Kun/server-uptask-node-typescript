import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import { taskBelongsToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auth";

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