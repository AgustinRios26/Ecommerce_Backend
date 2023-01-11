const express = require("express")
const authMiddleware = require("../middleware/auth")
const UserService = require("../services/users")


function users(app){
    const router = express.Router()
    const userServ = new UserService()

    app.use("/api/users",router)


    router.get("/",authMiddleware(2),async (req,res)=>{
       
        const users = await userServ.getAll() // Array de usuarios

        return res.json(users)
    })
}

module.exports = users 