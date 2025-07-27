import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[]; // changed from image: string
  category: string;
  condition: string;
  vintage: boolean;
  stock: number;
  isActive: boolean;
  rating?: number;
  reviews?: number;
  badge?: string;
}

const ProductSchema: Schema<IProduct> = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, required: true, min: 0 },
  images: { type: [String], required: true }, // changed from image: { type: String, required: true }
  // image: { type: String }, // remove or comment out the old image field
  category: { type: String, required: true },
  condition: { type: String, required: true, enum: ['Excellent', 'Good', 'Fair', 'Vintage'] },
  vintage: { type: Boolean, default: false },
  stock: { type: Number, default: 1, min: 0 },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviews: { type: Number, default: 0, min: 0 },
  badge: { type: String, default: 'New Arrival' }
}, { timestamps: true });

ProductSchema.index({ isActive: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ condition: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product; 