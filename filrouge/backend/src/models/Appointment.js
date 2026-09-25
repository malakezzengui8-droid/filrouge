import mongoose from 'mongoose';

const APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

const INITIATED_BY = ['DONOR', 'REQUESTER'];

const appointmentSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appointmentDate: {
      type: Date,
      default: null // set only once the requester confirms
    },
    location: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'PENDING'
    },
     initiatedBy: {
      type: String,
      enum: INITIATED_BY,
      default: 'DONOR'
    },
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);