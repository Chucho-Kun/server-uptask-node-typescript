import bcrypt from 'bcrypt';

export const hashPassword = async ( password : string ) => {
    const salt = await bcrypt.genSalt(5)
    return await bcrypt.hash( password , salt )
}

export const checkPassword = async (enteredPassword : string , storesdHash : string) => {

    return await bcrypt.compare( enteredPassword , storesdHash )

}