import mongoose from "mongoose";

const userBadgeSchema=new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    badge:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Badge"
    },

    earnedAt:{
        type:Date,
        default:Date.now
    },

    earnedDate:{
        type:Date,
        required:true
    }

});

userBadgeSchema.index(
    { user: 1, badge: 1, earnedDate: 1 },
    { unique: true }
);

export default mongoose.model(
    "UserBadge",
    userBadgeSchema
);