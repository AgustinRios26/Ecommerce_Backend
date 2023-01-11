const { production } = require("../config")

//creamos el token en caso de logearse o registrarse, esta cookie dura 7 dias

function authResponse(res,result,statusCode){

    if(result.success){
        const {token,...data} = result
        //Agregando data y mandando por json data no se envian los datos de token
        return res.cookie("token",token,{
            httpOnly:true,
            secure:production, //Solo disponible a través de https*
            sameSite:"none",
            expires:new Date(new Date().setDate(new Date().getDate() + 7))
        }).json(data)
    }


    return res.status(statusCode).json(result)
}

//Creamos la cookie en redes sociales

function providerResponse(res,result,statusCode){
    if(result.success){
        const {token,...data} = result

        return res.cookie("token",token,{
            httpOnly:true,
            secure:true, //Solo disponible a través de https*
            sameSite:"none",
            expires:new Date(new Date().setDate(new Date().getDate() + 7))
        }).redirect("http://localhost:5500") // o 3000
    }


    return res.status(statusCode).json(result)
}

//LogOut borrando el token en la cookie

function deleteCookie(res){
    return res.cookie("token","",{
        expires:new Date(),
        httpOnly:true,
        sameSite:"none",
        secure:production
    }).json({
        success:true,
        message:"Successfully logged out "
    })
}

module.exports = {authResponse,deleteCookie, providerResponse} 