const CartModel = require("../models/cart")
const UserModel = require("../models/user")
const PaymentsService = require("./payments")


class Cart{

    //Accedemos a los items del carrito 

    async getItems(idUser){
        const result = await CartModel.findById(idUser).populate("items._id","name price")

        return result
    }

    //Agregamos el producto al carrito del usuario

    async addToCart(idUser,idProduct,amount){
        const result = await CartModel.findByIdAndUpdate(idUser,{
            $push:{
                items:{
                    _id:idProduct,
                    amount
                }
            }
        },{new:true}).populate("items._id","name price")

        return result
    }

    //Removemos un producto del carrito del usuario

    async removeFromCart(idUser,idProduct){
        const result = await CartModel.findByIdAndUpdate(idUser,{
            $pull:{
                items:{
                    _id:idProduct
                }
            }
        },{new:true})

        return result
    }

    //Hacemos el pago del carrito a traves de stripe

    async pay(idUser,stripeCustomerID){
        // const {items} = await this.getItems(idUser)
        // console.log(items)
        // const total = items.reduce((result,item)=>{
        //     return result+(item._id.price*item.amount)
        // },0)*100

        // const paymentsServ = new PaymentsService()
        // const clientSecret = await paymentsServ.createIntent(total)
        // return {
        //     success:true,
        //     clientSecret
        // }
        const result = await this.getItems(idUser)
        if(result){
            const total = result.items.reduce((result,item)=>{
                return result+(item._id.price*item.amount)
            },0)*100

            if(total>0){
                const paymentsServ = new PaymentsService()
                const clientSecret = await paymentsServ.createIntent(total,idUser,stripeCustomerID)
                return {
                    success:true,
                    clientSecret
                }
            }else{
                return {
                    success:false,
                    message:"Tu cuenta debe ser mayor a 0"
                }
            }


        }else{
            return {
                success:false,
                message:"Ocurrió un error"
            }
    }
}
    //Hacemos que cuando se cree un usuario se crea un carrito
    async create(idUser){
        const cart = await CartModel.create({
            _id:idUser,
            items:[]
        })

        return cart
    }

        // async clearCart(idUser){
        //     const cart = await CartModel.findByIdAndUpdate(idUser,{
        //         items:[]
        //     },{new:true})
        //     return cart
        // }

        //Realizamos la limpieza del carrito cuando el pago es exitoso
    async clearCart(stripeCustomerID){
        const user = await UserModel.findOne({stripeCustomerID})
        const cart = await CartModel.findByIdAndUpdate(user.id,{
            items:[]
        },{new:true})

        return cart
    }


}

module.exports = Cart 