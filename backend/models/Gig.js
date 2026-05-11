import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryTime: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
    },
    avatar: {
  url: {
    type: String,
    required: true,
  },

  public_id: {
    type: String,
    required: true,
  },
},
     coverImage: {
  url: {
    type: String,
  },

  public_id: {
    type: String,
  },
},
        averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

const Gig = mongoose.model("Gig", gigSchema);
export default Gig;