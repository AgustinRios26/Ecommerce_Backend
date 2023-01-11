const { stripeSecretKey } = require("../config")
const ProductModel = require("../models/product")
const stripe = require("stripe")(stripeSecretKey)

class Products{

    //Obtenemos todos los productos y realizamos la paginacion

    async getAll(limit=8,page=1){
        const total = await ProductModel.count()
        const totalPages = Math.ceil(total / limit)
        if(page>totalPages || page<1){
            return {
                success:false,
                message:"Page not found"
            }
        }

        const skip = (page-1)*limit

        const products = await ProductModel.find().skip(skip).limit(limit)

        const nextPage = page===totalPages ? null: limit===20?`/api/products?page=${page+1}`:`/api/products?page=${page+1}&limit=${limit}`
        const prevPage = page===1 ? null : limit===20?`/api/products?page=${page-1}`:`/api/products?page=${page-1}&limit=${limit}`

        return {
            success:true,
            data:products,
            total,
            page,
            prevPage,
            nextPage,
            totalPages
        }
        
    }

    // Obtenemos un producto

    async getOne(id){
        try {
            const product = await ProductModel.findById(id)
            return product
        } catch (error) {
        }
    }

    //Metodo para crear el producto

    async create(data){
       // console.log(data.category)
        
        const product = await ProductModel.create(data)

        return product
    }

    // Obtenemos producto por dueño del producto

    async getProductByOwner(owner){
       // console.log(owner.owner)
        try {
            
            const product = await ProductModel.find({
                owner: {
                    $all: owner.owner
                }
            })
            if (product[0]){
                return product
            }
            return {
                error: true,
                message: "No products for this publisher"
            }
        } catch (error) {
            console.log(error);
        }
    
    }
  
    //Filtramos los productos por nombre, categoria y rango de precios
    
    async search(queryFilters) {
        let { priceLessThan, priceHigherThan, category, name } = queryFilters;
        [ priceLessThan, priceHigherThan, category, name] = [ priceLessThan?.trim(), priceHigherThan?.trim(), category?.trim(), name?.trim()];
    
        let queryBody = {};
        if(category) {
            queryBody = {
                ...queryBody,
                category: {
                    $elemMatch:{$regex: `.*${category}.*`, $options: "i"}
                }
            }
        }
        if(name) {
          queryBody = {
            ...queryBody,
                 $or: [
                                 {name:{$regex: `.*${name}.*`, $options: "i"}},
                                 {keyword:{$regex:`.*${name}.*`, $options: "i"}} 
                     ]
          };
        }
        if(priceLessThan) {
            queryBody = {
                ...queryBody,
                price: { $lte: priceLessThan }
            }
        }
        if(priceHigherThan) {
            queryBody = {
                ...queryBody,
                price: { $gte: priceHigherThan }
            }
        }

        const products = await ProductModel.find(queryBody)
        
        return {
            success:true,
            data:products,
        }
      }

}


module.exports = Products 