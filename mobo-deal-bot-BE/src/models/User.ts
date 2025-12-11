import mongoose , {Schema , InferSchemaType} from "mongoose";

const UserSchema = new Schema({
    name : {type : String , required : true},
    email : {type : String , required : true , unique : true},
    mobile : String,
    passwordHash : {type : String , required : true}
},
{timestamps : true});

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id : mongoose.Types.ObjectId};
export const UserModel = mongoose.model("User" , UserSchema);



