const express = require("express")
const ProductsService = require("../services/products")
const authMiddleware = require("../middleware/auth")

function products(app){
    const router = express.Router()
    const productsServ = new ProductsService()

    app.use("/api/products",router)

    router.get("/",async (req,res)=>{
        const limit = isNaN(parseInt(req.query.limit)) ? undefined: parseInt(req.query.limit)
        const page = isNaN(parseInt(req.query.page)) ? undefined: parseInt(req.query.page)
        const result = await productsServ.getAll(limit,page)

        return res.json(result)
    })

    router.get("/:id",  async(req,res) => { 
        const result = await productsServ.getOne(req.params.id)
        return res.json(result)
        
    })

    router.post("/",authMiddleware(1),async (req,res)=>{
        const result = await productsServ.create({
            ...req.body,
            owner:req.user.id
        })

        return res.json(result)
    })

    router.post("/owner", async (req, res) => {
        const product = await productsServ.getProductByOwner(req.body)
        return res.json(product)
    })
    
    router.get("/filter", async (req, res) => {
        const result = await productsServ.search(req.query);
        return res.json(result);
      });


}


module.exports = products 