import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEnvironment extends Document {
  name: string;
  description?: string;
  status: 'active' | 'archived';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnvironmentSchema: Schema<IEnvironment> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Environment name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Environment: Model<IEnvironment> =
  mongoose.models.Environment || mongoose.model<IEnvironment>('Environment', EnvironmentSchema);

export default Environment;
