import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  ciphertext: string;
  iv: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaultSchema = new Schema<IVaultItem>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  ciphertext: { type: String, required: true },
  iv: { type: String, required: true },
}, { timestamps: true });

export const VaultItem: Model<IVaultItem> = mongoose.models.VaultItem || mongoose.model<IVaultItem>("VaultItem", VaultSchema);
export default VaultItem;
