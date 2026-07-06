import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  ipAddress: string;
  serialNumber: string;
  site: Types.ObjectId;
  addedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
      trim: true,
    },
    serialNumber: {
      type: String,
      default: '',
      trim: true,
    },
    site: {
      type: Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  }
);

inventoryItemSchema.index({ site: 1 });
inventoryItemSchema.index({ name: 'text', serialNumber: 'text' });

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
