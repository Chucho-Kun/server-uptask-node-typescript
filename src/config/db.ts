import mongoose, { connection } from "mongoose";
import colors from 'colors';
import { exit } from "node:process"

export const connectDB = async () =>{
    try{
        const conexion = await mongoose.connect( process.env.DATABASE_URL )
        const url = `${ conexion.connection.host }:${ conexion.connection.port}`
        console.log( colors.yellow.bold(`Conectado a MongoDB en ${url}`) );
        
    }catch(e){
        console.log('error conectando con MongoDB');
        exit(1)
    }
} 
