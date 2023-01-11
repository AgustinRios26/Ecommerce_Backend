const { stripeSecretKey,endpointSecret } = require("../config")
const stripe = require("stripe")(stripeSecretKey)
const endpointSecrets =(endpointSecret)
const CartModel = require("../models/cart")
const UserModel = require("../models/user")

class Payments{
    // sesion de pago
    async createIntent(amount,idUser,stripeCustomerID){
        const intent = await stripe.paymentIntents.create({
            amount,//precio
            currency:"usd", // para pesos argentinos es "ars"
            customer:stripeCustomerID
        })

        // guardamos el client_secret

        return intent.client_secret
    }

    //Realizamos el pago de stripe

    async confirm(data,signature){
        let event;
        try {
            event = stripe.webhooks.constructEvent(data, signature, endpointSecrets);
        } catch (err) {
            return {success:false,message:`Webhook Error: ${err.message}`}
        }


        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(paymentIntent)
                const stripeCustomerID = paymentIntent.customer

                const user = await UserModel.findOne({stripeCustomerID})

                const cart = await CartModel.findByIdAndUpdate(user.id,{
                    items:[]
                },{new:true})
                break;
            // Podemos agregar otros handle events de stripe
            default:
                console.log(`Unhandled event type ${event.type}`);
        }


        return {
            success:true,
            message:"OK"
        }
    }
}

module.exports = Payments 