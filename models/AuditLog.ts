import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAuditLog extends Document {
  action: string; // e.g. RESOURCE_REQUEST, RESOURCE_APPROVED, RESOURCE_RELEASE
  details: string;
  userId: Types.ObjectId;
  resourceId?: Types.ObjectId;
  createdAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    action: {
      type: String,
      required: [true, 'Audit action type is required'],
      trim: true,
    },
    details: {
      type: String,
      required: [true, 'Audit details description is required'],
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Responsible user context is required'],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
