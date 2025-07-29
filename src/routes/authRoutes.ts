import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";


const router = Router()

router.post('/create-account' , 
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('password')
        .isLength({min:3}).withMessage('El password debe tener minimo 3 caracteres'),  
    body('password_confirmation').custom( ( value , { req }) => {
        if( value !== req.body.password ){
            throw new Error('Los passwords no son iguales')
        }
        return true
    }),
    body('email')
        .isEmail().withMessage('Correo no válido'),  
    handleInputErrors,
    AuthController.createAccount 
)

router.post('/confirm-account' , 
    body('token')
        .notEmpty().withMessage('El Token no puede ir vacio'),
        handleInputErrors,
        AuthController.confirmAccount
)

router.post('/login' , 
    body('email')
        .notEmpty().withMessage('Correo no válido'),
    body('password')
        .notEmpty().withMessage('El password es obligatorio'),  
        handleInputErrors,
        AuthController.login
)

router.post('/request-code' , 
    body('email')
        .notEmpty().withMessage('Correo no válido'),
        handleInputErrors,
        AuthController.requestConfirmationCode
)

router.post('/forgotten-password' , 
    body('email')
        .notEmpty().withMessage('Correo no válido'),
        handleInputErrors,
        AuthController.forgottenPassword
)

router.post('/validate-token' , 
    body('token')
    .notEmpty().withMessage('El token no puede ir vacio'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token' , 
    param('token').isNumeric().withMessage('Token no válido'),
    body('password')
        .isLength({min:3}).withMessage('El password debe tener minimo 3 caracteres'),  
    body('password_confirmation').custom( ( value , { req }) => {
        if( value !== req.body.password ){
            throw new Error('Los passwords no son iguales')
        }
        return true
    }),
    handleInputErrors,
    AuthController.uptadePasswordWithToken
)

router.get('/user' , authenticate , AuthController.user)

/** Profile */

router.put('/profile', 
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('email')
        .isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.updateProfile)

router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('El password actual no puede ir vacio'),
    body('password')
        .isLength({min:8}).withMessage('El password es muy corto, mínimo 8 caracteres'),
    body('password_confirmation').custom((value,{req}) => {
        if(value !== req.body.password){
            throw new Error('Los password no son iguales')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('El password es obligatorio'),
    handleInputErrors,
    
)

export default router