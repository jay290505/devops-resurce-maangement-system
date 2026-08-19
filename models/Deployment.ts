import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDeployment extends Document {
  resourceId: Types.ObjectId;
  version: string;
  commitHash?: string;
  deployedBy?: Types.ObjectId;
  status: 'success' | 'failed' | 'rolled_back';
  deployedAt: Date;
  previousVersion?: string;
}

const DeploymentSchema: Schema<IDeployment> = new Schema(
  {
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource ID is required'],
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
      trim: true,
    },
    commitHash: {
      type: String,
      trim: true,
    },
    deployedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: {
        values: ['success', 'failed', 'rolled_back'],
        message: '{VALUE} is not a valid status',
      },
      default: 'success',
    },
    deployedAt: {
      type: Date,
      default: Date.now,
    },
    previousVersion: {
      type: String,
      trim: true,
    },
  }
);

const Deployment: Model<IDeployment> = mongoose.models.Deployment || mongoose.model<IDeployment>('Deployment', DeploymentSchema);

export default Deployment;
