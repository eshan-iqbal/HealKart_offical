import mongoose, { Document, Schema, Model } from 'mongoose';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'admin';
  fullName: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  otp?: string;
  cart?: CartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CartItemSchema = new Schema<CartItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const UserSchema: Schema<IUser> = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  fullName: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  cart: { type: [CartItemSchema], default: [] },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 