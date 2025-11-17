import mongoose, { Schema, Document } from 'mongoose';

// User Profile Schema
export interface IProfile extends Document {
  user_id: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  state?: string;
  city?: string;
  address?: string;
  user_type: 'user' | 'admin';
  department?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    phone: { type: String },
    state: { type: String },
    city: { type: String },
    address: { type: String },
    user_type: { type: String, enum: ['user', 'admin'], default: 'user' },
    department: { type: String },
    avatar_url: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);

// Service Requests Schema
export interface IServiceRequest extends Document {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: 'raised' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  attachments?: string[];
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ['raised', 'assigned', 'in_progress', 'completed', 'closed'],
      default: 'raised',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assigned_to: { type: String, index: true },
    attachments: [String],
    completed_at: Date,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', serviceRequestSchema);

// Request Ratings Schema
export interface IRequestRating extends Document {
  request_id: string;
  user_id: string;
  rating: 'excellent' | 'good' | 'open_again';
  comments?: string;
  created_at: Date;
}

const requestRatingSchema = new Schema<IRequestRating>(
  {
    request_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    rating: {
      type: String,
      enum: ['excellent', 'good', 'open_again'],
      required: true,
    },
    comments: String,
  },
  { timestamps: { createdAt: 'created_at' } }
);

export const RequestRating = mongoose.model<IRequestRating>('RequestRating', requestRatingSchema);

// Security Questions Schema
export interface ISecurityQuestion extends Document {
  id: string;
  question: string;
  created_at: Date;
}

const securityQuestionSchema = new Schema<ISecurityQuestion>(
  {
    id: { type: String, required: true, unique: true },
    question: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

export const SecurityQuestion = mongoose.model<ISecurityQuestion>('SecurityQuestion', securityQuestionSchema);

// Security Answers Schema
export interface ISecurityAnswer extends Document {
  user_id: string;
  question_id: string;
  answer_hash: string;
  created_at: Date;
  updated_at: Date;
}

const securityAnswerSchema = new Schema<ISecurityAnswer>(
  {
    user_id: { type: String, required: true, index: true },
    question_id: { type: String, required: true },
    answer_hash: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const SecurityAnswer = mongoose.model<ISecurityAnswer>('SecurityAnswer', securityAnswerSchema);

// Password Reset Tokens Schema
export interface IPasswordResetToken extends Document {
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    user_id: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expires_at: { type: Date, required: true, index: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

export const PasswordResetToken = mongoose.model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);

// Request Status History Schema
export interface IStatusHistory extends Document {
  request_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  reason?: string;
  created_at: Date;
}

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    request_id: { type: String, required: true, index: true },
    old_status: String,
    new_status: String,
    changed_by: { type: String, required: true },
    reason: String,
  },
  { timestamps: { createdAt: 'created_at' } }
);

export const StatusHistory = mongoose.model<IStatusHistory>('StatusHistory', statusHistorySchema);

// Admin Work Assignment Schema
export interface IWorkAssignment extends Document {
  id: string;
  request_id: string;
  assigned_to: string;
  assigned_by: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: Date;
  updated_at: Date;
}

const workAssignmentSchema = new Schema<IWorkAssignment>(
  {
    id: { type: String, required: true, unique: true },
    request_id: { type: String, required: true, index: true },
    assigned_to: { type: String, required: true, index: true },
    assigned_by: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const WorkAssignment = mongoose.model<IWorkAssignment>('WorkAssignment', workAssignmentSchema);

// Department Schema
export interface IDepartment extends Document {
  name: string;
  description?: string;
  created_at: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: String,
  },
  { timestamps: { createdAt: 'created_at' } }
);

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
