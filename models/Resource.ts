import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IResourceSpec {
  cpu: number;
  ram: number;
  region: string;
}

export interface IResource extends Document {
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  environment: string;
  status: 'healthy' | 'degraded' | 'down';
  owner: Types.ObjectId;
  specs: IResourceSpec;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema<IResource> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['server', 'database', 'service', 'container'],
        message: '{VALUE} is not a valid resource type',
      },
      required: [true, 'Resource type is required'],
    },
    environment: {
      type: String,
      required: [true, 'Environment is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['healthy', 'degraded', 'down'],
        message: '{VALUE} is not a valid status',
      },
      default: 'healthy',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    specs: {
      cpu: {
        type: Number,
        required: [true, 'CPU specification is required'],
      },
      ram: {
        type: Number,
        required: [true, 'RAM specification is required'],
      },
      region: {
        type: String,
        required: [true, 'Region specification is required'],
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;
