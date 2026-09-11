import mongoose from 'mongoose';

const BLOOD_TYPES = [
  'A_POSITIVE', 'A_NEGATIVE',
  'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE',
  'O_POSITIVE', 'O_NEGATIVE'
];

const REQUEST_STATUSES = ['ACTIVE', 'FULFILLED', 'CANCELLED'];

const bloodRequestSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // links this request to the User who published it
      required: true
    },
    bloodTypeNeeded: {
      type: String,
      enum: BLOOD_TYPES,
      required: [true, 'Blood type needed is required']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true
    },
    reason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'ACTIVE'
    }
  },
  { timestamps: true } // createdAt / updatedAt
);

export default mongoose.model('BloodRequest', bloodRequestSchema);