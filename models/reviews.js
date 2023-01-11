import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: [true, "The product is required"]
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "The user is required"]
    },
    stars: {
        type: Number,
        required: [true, "The rating is required"],
        trim: true
    },
    title: {
        type: String,
        required: [true, "The title is required"],
        trim: true
    },
    comment: {
        type: String,
        required: [true, "The comment is required"],
        trim: true
    }
},
//  { timestamps: true }
 );

const ReviewModel = mongoose.model("review",reviewSchema)

module.exports = ReviewModel
 