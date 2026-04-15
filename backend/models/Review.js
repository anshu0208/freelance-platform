import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    gigId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Gig",
       required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true, // ✅ BEST WAY
        },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
      type: String,
      required: true ,
      trim: true
    },
    isEdited: {
        type: Boolean,
        default: false
        }
}, 
{
    timestamps: true
}
)

reviewSchema.index({ gigId: 1 });
reviewSchema.index({ sellerId: 1 });
const Review = mongoose.model("Review", reviewSchema);
export default Review;