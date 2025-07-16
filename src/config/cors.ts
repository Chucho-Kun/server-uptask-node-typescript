import { CorsOptions } from "cors";


export const corsConfig : CorsOptions = {
    origin: function( origin , callback ){
        console.log({origin});
        const whitelist = [process.env.FRONTEND_URL ]
        //if( !origin || whitelist.includes(origin)){
        if(origin === process.env.FRONTEND_URL || !origin){  
        callback(null , true)
        }else{
            callback(new Error('Conexión bloqueada por configuracion de CORS'))
        }
    }
}