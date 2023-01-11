const { stripeSecretKey } = require("../config")
const dbError = require("../helpers/dbError")
const UserModel = require("../models/user")
const CartService = require("../services/cart")
const stripe = require("stripe")(stripeSecretKey)
const uuid = require("uuid")


class User{

    async getAll(){
        try{
            const users = await UserModel.find()
            return users 
        }catch(error){
            console.log(error)
        }
    }

    //Buscamos usuario por email 

    async getByEmail(email){
        try {
            const customer = await UserModel.findOne({email})

            return customer
        } catch (error) {
            console.log(error)
            return error
        }
    }

    //Metodo para iniciar sesion / registrarse por red social, y en caso de tener ese mismo mail asociado a una cuenta, se vinculan estas redes sociales a esas cuentas y tambien creamos los datos de stripe

    async getOrCreateByProvider(data){
       
        const userData = {
            provider:{
                [data.provider]:true
            },
            idProvider:{
                [data.provider]:data.idProvider
            }
        }
        
        let user = await UserModel.findOne(userData)
        console.log(user)
        if(!user){
            data.password = uuid.v4()
            const newData ={
                ...data,
                ...userData
            }
       
        let stripeCustomerID

        try {
            const customer = await stripe.customers.create({
                name:data.name,
                email:data.email
            })
            stripeCustomerID = customer.id
            user = await UserModel.create({
                ...newData,
                stripeCustomerID
            })
        } catch (error) {
            const customer = await stripe.customers.del(stripeCustomerID)
            if(error.code===11000 && error.keyValue.email){ // Entrada duplicada
                const email = error.keyValue.email
                const provider = "provider."+data.provider
                const idProvider = "idProvider."+data.provider
                user = await UserModel.findOneAndUpdate({
                    email
                },{
                    [provider]:true,
                    [idProvider]:data.idProvider
                },{new:true})
                
                return {
                    created:true,
                    user
                }
            }

            return dbError(error)
            }
        }
        return {
            created:true,
            user
        }
    }

    //Creamos los datos de usuario y los datos de stripe

    async create(data){
        let stripeCustomerID
        try{
            // const user = await UserModel.create(data)
            const customer = await stripe.customers.create({
                name:data.name,
                email:data.email
            })
            stripeCustomerID = customer.id
            const user = await UserModel.create({
                ...data,
                stripeCustomerID
            })
            const cartServ = new CartService()
            const cart = await cartServ.create(user.id)
            return {
                created:true,
                user
            }
        }catch(error){
            const customer = await stripe.customers.del(stripeCustomerID)
          //  console.log(error)
          return dbError(error)
        }
    }
}

module.exports = User