import jwt from "jsonwebtoken"
import { Types } from "mongoose"

type UserPayload = {
    id: Types.ObjectId
}

export const generateJWT = ( payload : UserPayload ) => {
 // expiresIn: 1d, 30s, 5m, 1y, 1h
    const token = jwt.sign( payload , process.env.JWT_SECRET , {
        expiresIn: '6m'
    } )
    return token
}