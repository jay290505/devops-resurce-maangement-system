import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRequest extends Document {
  name: string;
  type: 'server' | 'database' | 'service' | 'container';
  specs: {
    cpu: number;
    ram: number;
    region: string;
  };
  environment: string;
  purpose: string;
  duration: number; // in days
  status: 'pending' | 'approved' | 'rejected' | 'provisioned';
  comments?: string;
  requestedBy: Types.ObjectId;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema: Schema<IRequest> = new Schema(
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
    environment: {
      type: String,
      required: [true, 'Environment namespace is required'],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Request purpose is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Request duration in days is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'provisioned'],
      default: 'pending',
    },
    comments: {
      type: String,
      trim: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requesting user context is required'],
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Request: Model<IRequest> =
  mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);

export default Request;
