# jest.config.js

```js
export default {
  testEnvironment: 'node'
};
```

# package.json

```json
{
  "name": "blood-is-gold-backend",
  "version": "1.0.0",
  "description": "Backend API for Your Blood is Gold - blood donation platform",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon server.js",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand"
  },
  "dependencies": {
    "express": "^4.19.2",
    "mongoose": "^8.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5",
    "express-validator": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4",
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

# src\app.js

```js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import errorHandler from './middlewares/errorMiddleware.js';

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler (must be LAST)
app.use(errorHandler);

export default app;
```

# src\config\db.js

```js
import mongoose from "mongoose";
export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

```

# src\controllers\adminController.js

```js
import * as adminService from '../services/adminService.js';

// GET /api/admin/users
async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/users/:id
async function getUser(req, res, next) {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/users/:id
async function updateUser(req, res, next) {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/requests
async function getAllRequests(req, res, next) {
  try {
    const requests = await adminService.getAllRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/requests/:id/status
async function updateRequestStatus(req, res, next) {
  try {
    const request = await adminService.updateRequestStatusAsAdmin(req.params.id, req.body.status);
    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/statistics
async function getStatistics(req, res, next) {
  try {
    const stats = await adminService.getStatistics();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

export { getAllUsers, getUser, updateUser, deleteUser, getAllRequests, updateRequestStatus, getStatistics };
```

# src\controllers\appointmentController.js

```js
import * as appointmentService from '../services/appointmentService.js';

// POST /api/requests/:id/appointments
async function createAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.createAppointment(req.params.id, req.user.id);
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

// POST /api/requests/:id/invite  (body: { donorId })
async function inviteDonor(req, res, next) {
  try {
    const appointment = await appointmentService.inviteDonor(
      req.params.id,
      req.body.donorId,
      req.user.id,
      req.user.role
    );
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/:id/appointments
async function getRequestAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.getRequestAppointments(req.params.id, req.user.id, req.user.role);
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
}

// GET /api/appointments/me
async function getMyAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.getMyAppointments(req.user.id);
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/confirm
async function confirmAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.confirmAppointment(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/reject
async function rejectAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.rejectAppointment(req.params.id, req.user.id, req.user.role);
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/cancel
async function cancelAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.id, req.user.id, req.user.role);
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/complete
async function completeAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.completeAppointment(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
}

export {
  createAppointment,
  inviteDonor,
  getRequestAppointments,
  getMyAppointments,
  confirmAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment
};

```

# src\controllers\authController.js

```js
import * as authService from '../services/authService.js';

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me  (protected route)
async function getMe(req, res, next) {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// PUT /api/auth/me  (protected route)
async function updateMe(req, res, next) {
  try {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/auth/me  (protected route)
async function deleteMe(req, res, next) {
  try {
    await authService.deleteUserAccount(req.user.id);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/eligibility  (protected route)
async function getEligibility(req, res, next) {
  try {
    const eligibility = await authService.getEligibility(req.user.id);
    res.status(200).json(eligibility);
  } catch (error) {
    next(error);
  }
}

export { register, login, getMe, updateMe, deleteMe, getEligibility };
```

# src\controllers\donorController.js

```js
import * as donorService from '../services/donorService.js';

async function getDonors(req, res, next) {
  try {
    const { city, bloodType } = req.query;
    const donors = await donorService.searchDonors({ city, bloodType });
    res.status(200).json(donors);
  } catch (error) {
    next(error);
  }
}

export { getDonors };
```

# src\controllers\requestController.js

```js
import * as requestService from "../services/requestService.js";

// POST /api/requests
async function publish(req, res, next) {
  try {
    const request = await requestService.publishRequest(req.user.id, req.body);
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
}

// GET /api/requests?city=&bloodType=
async function getAll(req, res, next) {
  try {
    const { city, bloodType } = req.query;
    const requests = await requestService.getActiveRequests({
      city,
      bloodType,
    });
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/:id
async function getOne(req, res, next) {
  try {
    const request = await requestService.getRequestById(req.params.id);
    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
}

// PUT /api/requests/:id/status
async function updateStatus(req, res, next) {
  try {
    const request = await requestService.updateRequestStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status,
    );
    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/:id/compatible-donors
async function getCompatibleDonors(req, res, next) {
  try {
    // console.log("************* get user id **************");
    // console.log(req.user);
    // console.log("************* get user id **************");
    const userId = req.user.id;
    const donors = await requestService.findCompatibleDonors(
      req.params.id,
      userId,
    );
    res.status(200).json(donors);
  } catch (error) {
    next(error);
  }
}
// GET /api/requests/me
async function getMine(req, res, next) {
  try {
    const requests = await requestService.getMyRequests(req.user.id);
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
}

export { publish, getAll, getOne, updateStatus, getCompatibleDonors, getMine };

```

# src\middlewares\authMiddleware.js

```js
import jwt from 'jsonwebtoken';

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, access denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export { protect };
```

# src\middlewares\errorMiddleware.js

```js
function errorHandler(err, req, res, next) {
  console.error(err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server'
  });
}

export default errorHandler;
```

# src\middlewares\roleMiddleware.js

```js
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission for this action' });
    }
    next();
  };
}

export { authorize };
```

# src\models\Appointment.js

```js
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
```

# src\models\BloodRequest.js

```js
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
```

# src\models\User.js

```js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BLOOD_TYPES = [
  'A_POSITIVE', 'A_NEGATIVE',
  'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE',
  'O_POSITIVE', 'O_NEGATIVE'
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
      // NOTE: no "select: false" here -> email must always be visible/queryable normally
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      trim: true
    },
    CIN: {
      type: String,
      required: [true, 'CIN is required'],
      unique: true,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    bloodType: {
      type: String,
      enum: BLOOD_TYPES
    },
    lastDonationDate: {
      type: Date,
      default: null
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER'
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
```

# src\routes\adminRoutes.js

```js
import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { updateStatusRules, validate } from '../validators/requestValidator.js';

const router = express.Router();

// Every route here requires: 1) a valid token, 2) the ADMIN role
router.get('/users', protect, authorize('ADMIN'), adminController.getAllUsers);
router.get('/users/:id', protect, authorize('ADMIN'), adminController.getUser);
router.put('/users/:id', protect, authorize('ADMIN'), adminController.updateUser);
router.delete('/users/:id', protect, authorize('ADMIN'), adminController.deleteUser);

router.get('/requests', protect, authorize('ADMIN'), adminController.getAllRequests);
router.put('/requests/:id/status', protect, authorize('ADMIN'), updateStatusRules, validate, adminController.updateRequestStatus);

router.get('/statistics', protect, authorize('ADMIN'), adminController.getStatistics);

export default router;
```

# src\routes\appointmentRoutes.js

```js
import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { confirmRules, validate } from '../validators/appointmentValidator.js';

const router = express.Router();

router.get('/me', protect, appointmentController.getMyAppointments);
router.put('/:id/confirm', protect, confirmRules, validate, appointmentController.confirmAppointment);
router.put('/:id/reject', protect, appointmentController.rejectAppointment);
router.put('/:id/cancel', protect, appointmentController.cancelAppointment);
router.put('/:id/complete', protect, appointmentController.completeAppointment);

export default router;

```

# src\routes\authRoutes.js

```js
import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { registerRules, loginRules, validate } from '../validators/authValidator.js';

const router = express.Router();

// Public routes
router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);

// Protected routes (need a valid JWT)
router.get('/me', protect, authController.getMe);
router.get('/eligibility', protect, authController.getEligibility);
router.put('/me', protect, authController.updateMe);
router.delete('/me', protect, authController.deleteMe);

export default router;
```

# src\routes\donorRoutes.js

```js
import express from 'express';
import * as donorController from '../controllers/donorController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { filterRules, validate } from '../validators/donorValidator.js';

const router = express.Router();

router.get('/', protect, filterRules, validate, donorController.getDonors);

export default router;
```

# src\routes\requestRoutes.js

```js
import express from 'express';
import * as requestController from '../controllers/requestController.js';
import * as appointmentController from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { createRequestRules, updateStatusRules, validate } from '../validators/requestValidator.js';

const router = express.Router();

router.post('/', protect, createRequestRules, validate, requestController.publish);
router.get('/', protect, requestController.getAll);
router.get('/me', protect, requestController.getMine);
router.get('/:id', protect, requestController.getOne);
router.get('/:id/compatible-donors', protect, requestController.getCompatibleDonors);
router.put('/:id/status', protect, updateStatusRules, validate, requestController.updateStatus);

// Appointments nested under a specific request
router.post('/:id/appointments', protect, appointmentController.createAppointment);
router.get('/:id/appointments', protect, appointmentController.getRequestAppointments);
router.post('/:id/invite', protect, appointmentController.inviteDonor);

export default router;
```

# src\server.js

```js
import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

# src\services\adminService.js

```js
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';

// manageUsers() -> list all users
async function getAllUsers() {
  return User.find(); // password is excluded automatically (select: false in schema)
}

async function getUserById(userId) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function updateUser(userId, updates) {
  // admin is allowed to change more fields than a regular user updating themselves,
  // including the role (e.g. promote a user to ADMIN)
  const allowedFields = ['name', 'phone', 'city', 'bloodType', 'role', 'lastDonationDate'];
  const safeUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      safeUpdates[field] = updates[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, safeUpdates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

// manageRequests() -> list ALL requests, whatever their status
async function getAllRequests() {
  return BloodRequest.find()
    .populate('createdBy', 'name city phone')
    .sort({ createdAt: -1 });
}

// manageRequests() -> admin can force-update any request's status
async function updateRequestStatusAsAdmin(requestId, newStatus) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  request.status = newStatus;
  await request.save();

  return request;
}

// viewStatistics() -> aggregate counts for the admin dashboard
async function getStatistics() {
  const [totalUsers, totalAdmins, totalRequests, activeRequests, fulfilledRequests, cancelledRequests] =
    await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'ADMIN' }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'ACTIVE' }),
      BloodRequest.countDocuments({ status: 'FULFILLED' }),
      BloodRequest.countDocuments({ status: 'CANCELLED' })
    ]);

  return {
    totalUsers,
    totalAdmins,
    totalRequests,
    activeRequests,
    fulfilledRequests,
    cancelledRequests
  };
}

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllRequests,
  updateRequestStatusAsAdmin,
  getStatistics
};
```

# src\services\appointmentService.js

```js
import Appointment from '../models/Appointment.js';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import { DONATION_INTERVAL_DAYS, calculateNextDonationDate, checkEligibility } from '../utils/eligibility.js';
import { isCompatibleDonor } from '../utils/compatibility.js';

async function checkDonorCanApply(donor, request) {
  if (!isCompatibleDonor(donor.bloodType, request.bloodTypeNeeded)) {
    const error = new Error('This donor blood type is not compatible with the request');
    error.statusCode = 409;
    throw error;
  }

  if (!checkEligibility(donor.lastDonationDate).eligible) {
    const error = new Error('This donor is not eligible to donate yet');
    error.statusCode = 409;
    throw error;
  }

  const confirmedAppointment = await Appointment.findOne({
    donor: donor._id,
    status: 'CONFIRMED'
  });

  if (confirmedAppointment) {
    const error = new Error('This donor already has a confirmed appointment');
    error.statusCode = 409;
    throw error;
  }
}

// Donor proposes to help with a request -> creates a PENDING appointment (initiatedBy: DONOR)
async function createAppointment(requestId, donorId) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== 'ACTIVE') {
    const error = new Error('This request is no longer active');
    error.statusCode = 400;
    throw error;
  }

  const donor = await User.findById(donorId);
  if (!donor || donor.role !== 'USER') {
    const error = new Error('Donor not found');
    error.statusCode = 404;
    throw error;
  }

  await checkDonorCanApply(donor, request);

  const existing = await Appointment.findOne({
    request: requestId,
    donor: donorId,
    status: { $in: ['PENDING', 'CONFIRMED'] }
  });

  if (existing) {
    const error = new Error('You already have a pending or confirmed appointment for this request');
    error.statusCode = 409;
    throw error;
  }

  const appointment = await Appointment.create({
    request: requestId,
    donor: donorId,
    initiatedBy: 'DONOR'
  });

  return appointment;
}

// Request owner (or admin) invites a specific donor -> creates a PENDING appointment (initiatedBy: REQUESTER)
async function inviteDonor(requestId, donorId, requesterId, requesterRole) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = request.createdBy.toString() === requesterId;
  if (!isOwner && requesterRole !== 'ADMIN') {
    const error = new Error('You are not allowed to invite donors for this request');
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== 'ACTIVE') {
    const error = new Error('This request is no longer active');
    error.statusCode = 400;
    throw error;
  }

  const donor = await User.findById(donorId);
  if (!donor || donor.role !== 'USER') {
    const error = new Error('Donor not found');
    error.statusCode = 404;
    throw error;
  }

  await checkDonorCanApply(donor, request);

  const existing = await Appointment.findOne({
    request: requestId,
    donor: donorId,
    status: { $in: ['PENDING', 'CONFIRMED'] }
  });

  if (existing) {
    const error = new Error('This donor already has a pending or confirmed appointment for this request');
    error.statusCode = 409;
    throw error;
  }

  const appointment = await Appointment.create({
    request: requestId,
    donor: donorId,
    initiatedBy: 'REQUESTER'
  });

  return appointment.populate('donor', 'name city phone bloodType');
}

// Request owner (or admin) views all appointments proposed/sent for their request
async function getRequestAppointments(requestId, userId, userRole) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = request.createdBy.toString() === userId;
  if (!isOwner && userRole !== 'ADMIN') {
    const error = new Error('You are not allowed to view appointments for this request');
    error.statusCode = 403;
    throw error;
  }

  return Appointment.find({ request: requestId }).populate('donor', 'name city phone bloodType');
}

// Donor views their own appointments: offers they made + invitations they received
async function getMyAppointments(donorId) {
  return Appointment.find({ donor: donorId })
    .populate('request', 'bloodTypeNeeded city hospital status')
    .sort({ createdAt: -1 });
}

// Whoever did NOT initiate the appointment confirms it: sets date/location, moves to CONFIRMED
async function confirmAppointment(appointmentId, userId, userRole, { appointmentDate, location }) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isRequestOwner = appointment.request.createdBy.toString() === userId;
  const isDonor = appointment.donor.toString() === userId;

  const canAct =
    appointment.initiatedBy === 'DONOR'
      ? isRequestOwner || userRole === 'ADMIN'
      : isDonor || userRole === 'ADMIN';

  if (!canAct) {
    const error = new Error('You are not allowed to confirm this appointment');
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status !== 'PENDING') {
    const error = new Error('Only a pending appointment can be confirmed');
    error.statusCode = 400;
    throw error;
  }

  const donationDate = new Date(appointmentDate);
  const donor = await User.findById(appointment.donor);

  if (!donor || !isCompatibleDonor(donor.bloodType, appointment.request.bloodTypeNeeded)) {
    const error = new Error('The donor blood type is not compatible with this request');
    error.statusCode = 409;
    throw error;
  }

  const nextDonationDate = calculateNextDonationDate(donor?.lastDonationDate);

  if (nextDonationDate && donationDate < nextDonationDate) {
    const error = new Error(`A donor can only donate once every ${DONATION_INTERVAL_DAYS} days`);
    error.statusCode = 409;
    throw error;
  }

  const intervalInMs = DONATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
  const intervalStart = new Date(donationDate.getTime() - intervalInMs);
  const intervalEnd = new Date(donationDate.getTime() + intervalInMs);
  const existingDonation = await Appointment.findOne({
    donor: appointment.donor,
    status: { $in: ['CONFIRMED', 'COMPLETED'] },
    appointmentDate: { $gt: intervalStart, $lt: intervalEnd },
    _id: { $ne: appointment._id }
  });

  if (existingDonation) {
    const error = new Error(`This donor already has a donation within ${DONATION_INTERVAL_DAYS} days`);
    error.statusCode = 409;
    throw error;
  }

  appointment.status = 'CONFIRMED';
  appointment.appointmentDate = appointmentDate;
  if (location) appointment.location = location;
  await appointment.save();

  return appointment.populate('donor', 'name city phone bloodType');
}

// Whoever did NOT initiate the appointment rejects a pending one
async function rejectAppointment(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isRequestOwner = appointment.request.createdBy.toString() === userId;
  const isDonor = appointment.donor.toString() === userId;

  const canAct =
    appointment.initiatedBy === 'DONOR'
      ? isRequestOwner || userRole === 'ADMIN'
      : isDonor || userRole === 'ADMIN';

  if (!canAct) {
    const error = new Error('You are not allowed to reject this appointment');
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status !== 'PENDING') {
    const error = new Error('Only a pending appointment can be rejected');
    error.statusCode = 400;
    throw error;
  }

  appointment.status = 'REJECTED';
  await appointment.save();

  return appointment.populate('donor', 'name city phone bloodType');
}

// Either participant (or an admin) can cancel a pending or confirmed appointment.
async function cancelAppointment(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isRequestOwner = appointment.request.createdBy.toString() === userId;
  const isDonor = appointment.donor.toString() === userId;
  if (!isRequestOwner && !isDonor && userRole !== 'ADMIN') {
    const error = new Error('You are not allowed to cancel this appointment');
    error.statusCode = 403;
    throw error;
  }

  if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
    const error = new Error('This appointment cannot be cancelled');
    error.statusCode = 400;
    throw error;
  }

  appointment.status = 'CANCELLED';
  await appointment.save();
  return appointment.populate('donor', 'name city phone bloodType');
}

// The request owner (or an admin) confirms that a scheduled donation really happened.
async function completeAppointment(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId).populate('request');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  const isRequestOwner = appointment.request.createdBy.toString() === userId;
  if (!isRequestOwner && userRole !== 'ADMIN') {
    const error = new Error('You are not allowed to complete this appointment');
    error.statusCode = 403;
    throw error;
  }

  if (!['CONFIRMED', 'COMPLETED'].includes(appointment.status)) {
    const error = new Error('Only a confirmed appointment can be completed');
    error.statusCode = 400;
    throw error;
  }

  if (!appointment.appointmentDate || appointment.appointmentDate > new Date()) {
    const error = new Error('A future appointment cannot be completed');
    error.statusCode = 400;
    throw error;
  }

  // Saving first, then accepting COMPLETED on retries, makes this operation safe to repeat.
  if (appointment.status !== 'COMPLETED') {
    appointment.status = 'COMPLETED';
    await appointment.save();
  }

  // $max prevents an older appointment from replacing a newer donation date.
  await User.findByIdAndUpdate(appointment.donor, {
    $max: { lastDonationDate: appointment.appointmentDate }
  });

  return appointment.populate('donor', 'name city phone bloodType');
}

export {
  createAppointment,
  inviteDonor,
  getRequestAppointments,
  getMyAppointments,
  confirmAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment
};

```

# src\services\authService.js

```js
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { checkEligibility } from '../utils/eligibility.js';

async function registerUser({ name, email, password, CIN, phone, city, bloodType }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const existingCIN = await User.findOne({ CIN });
  if (existingCIN) {
    const error = new Error('CIN is already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password, CIN, phone, city, bloodType });
  console.log(user.body)

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      CIN: user.CIN,
      role: user.role,
      city: user.city,
      bloodType: user.bloodType
    }
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      CIN: user.CIN,
      role: user.role,
      city: user.city,
      bloodType: user.bloodType
    }
  };
}

async function getUserProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function updateUserProfile(userId, updates) {
  // lastDonationDate is updated only when an appointment is completed.
  const allowedFields = ['name', 'phone', 'city', 'bloodType'];
  const safeUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      safeUpdates[field] = updates[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, safeUpdates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

async function deleteUserAccount(userId) {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function getEligibility(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return checkEligibility(user.lastDonationDate);
}

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getEligibility
};

```

# src\services\donorService.js

```js
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { checkEligibility } from '../utils/eligibility.js';

async function searchDonors({ city, bloodType }) {
  const filter = { role: 'USER' };

  if (city) {
    filter.city = new RegExp(`^${city}$`, 'i');
  }

  if (bloodType) {
    filter.bloodType = bloodType;
  }

  const donors = await User.find(filter).select('name city bloodType phone lastDonationDate');
  const busyDonorIds = await Appointment.distinct('donor', { status: 'CONFIRMED' });
  const busyDonors = new Set(busyDonorIds.map(String));

  return donors.filter(
    (donor) => checkEligibility(donor.lastDonationDate).eligible && !busyDonors.has(donor._id.toString())
  );
}

export { searchDonors };

```

# src\services\requestService.js

```js
import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import { getCompatibleDonorTypes } from "../utils/compatibility.js";
import { checkEligibility } from "../utils/eligibility.js";
import mongoose from "mongoose";

// + publish()
async function publishRequest(
  userId,
  { bloodTypeNeeded, city, hospital, reason },
) {
  const request = await BloodRequest.create({
    createdBy: userId,
    bloodTypeNeeded,
    city,
    hospital,
    reason,
  });

  return request;
}
async function getMyRequests(userId) {
  const requests = await BloodRequest.find({ createdBy: userId }).sort({
    createdAt: -1,
  });

  return requests;
}

async function getActiveRequests({ city, bloodType }) {
  const filter = { status: "ACTIVE" };

  if (city) filter.city = new RegExp(`^${city}$`, "i");
  if (bloodType) filter.bloodTypeNeeded = bloodType;

  // populate: replaces createdBy (an ObjectId) with actual user fields
  const requests = await BloodRequest.find(filter)
    .populate("createdBy", "name city phone")
    .sort({ createdAt: -1 }); // newest first

  return requests;
}

async function getRequestById(requestId) {
  const request = await BloodRequest.findById(requestId).populate(
    "createdBy",
    "name city phone",
  );

  if (!request) {
    const error = new Error("Blood request not found");
    error.statusCode = 404;
    throw error;
  }

  return request;
}

// + updateStatus()
async function updateRequestStatus(requestId, userId, userRole, newStatus) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error("Blood request not found");
    error.statusCode = 404;
    throw error;
  }

  // only the creator OR an admin can change the status
  const isOwner = request.createdBy.toString() === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isAdmin) {
    const error = new Error("You are not allowed to update this request");
    error.statusCode = 403;
    throw error;
  }

  request.status = newStatus;
  await request.save();

  return request;
}

// <<extend>> Find potentially compatible donors for a given request
async function findCompatibleDonors(requestId, userId) {
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    const error = new Error("Blood request not found");
    error.statusCode = 404;
    throw error;
  }

  const compatibleTypes = getCompatibleDonorTypes(request.bloodTypeNeeded);

 

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const donors = await User.aggregate([
    {
      $match: {
        _id: { $ne: userObjectId },
        role: "USER",
        bloodType: { $in: compatibleTypes },
        city: new RegExp(`^${request.city}$`, "i"),
      },
    },

    {
      $lookup: {
        from: "bloodrequests",
        let: { donorId: "$_id" },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$createdBy", "$$donorId"] },
                  { $eq: ["$status", "ACTIVE"] },
                ],
              },
            },
          },
        ],

        as: "activeRequests",
      },
    },

    {
      $match: {
        activeRequests: { $size: 0 },
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        city: 1,
        bloodType: 1,
      },
    },
  ]);

  // console.log(donnersAggr);

  const busyDonorIds = await Appointment.distinct("donor", {
    status: "CONFIRMED",
  });

  const busyDonors = new Set(busyDonorIds.map(String));

  return donors.filter(
    (donor) =>
      checkEligibility(donor.lastDonationDate).eligible &&
      !busyDonors.has(donor._id.toString()),
  );
}

export {
  publishRequest,
  getActiveRequests,
  getRequestById,
  updateRequestStatus,
  findCompatibleDonors,
  getMyRequests,
};

```

# src\utils\compatibility.js

```js
// Medical rule: which donor blood types can safely give blood to a recipient of a given type.
// Key = blood type NEEDED (recipient), Value = list of donor blood types that are compatible.
const COMPATIBILITY_MAP = {
  O_NEGATIVE: ['O_NEGATIVE'],
  O_POSITIVE: ['O_POSITIVE', 'O_NEGATIVE'],
  A_NEGATIVE: ['A_NEGATIVE', 'O_NEGATIVE'],
  A_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  B_NEGATIVE: ['B_NEGATIVE', 'O_NEGATIVE'],
  B_POSITIVE: ['B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  AB_NEGATIVE: ['AB_NEGATIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'O_NEGATIVE'],
  AB_POSITIVE: ['AB_POSITIVE', 'AB_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
};

function getCompatibleDonorTypes(bloodTypeNeeded) {
  return COMPATIBILITY_MAP[bloodTypeNeeded] || [];
}

function isCompatibleDonor(donorBloodType, bloodTypeNeeded) {
  return getCompatibleDonorTypes(bloodTypeNeeded).includes(donorBloodType);
}

export { getCompatibleDonorTypes, isCompatibleDonor };

```

# src\utils\eligibility.js

```js
// One simple, conservative rule for every donor.
const DONATION_INTERVAL_DAYS = 120;

function calculateNextDonationDate(lastDonationDate) {
  if (!lastDonationDate) return null;

  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + DONATION_INTERVAL_DAYS);
  return nextDate;
}

function calculateDaysRemaining(nextDonationDate) {
  if (!nextDonationDate) return 0;

  const today = new Date();
  const diffInMs = nextDonationDate.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays > 0 ? diffInDays : 0;
}

function checkEligibility(lastDonationDate) {
  const nextDonationDate = calculateNextDonationDate(lastDonationDate);
  const daysRemaining = calculateDaysRemaining(nextDonationDate);

  return {
    lastDonationDate: lastDonationDate || null,
    nextDonationDate,
    daysRemaining,
    eligible: daysRemaining === 0
  };
}

export { DONATION_INTERVAL_DAYS, calculateNextDonationDate, calculateDaysRemaining, checkEligibility };

```

# src\utils\generateToken.js

```js
import jwt from 'jsonwebtoken';

function generateToken(userId, role) {
  console.log(process.env.JWT_SECRET)
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export default generateToken;
```

# src\validators\appointmentValidator.js

```js
import { body, validationResult } from 'express-validator';

const confirmRules = [
  body('appointmentDate').isISO8601().withMessage('A valid appointment date is required'),
  body('location').optional().trim()
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { confirmRules, validate };
```

# src\validators\authValidator.js

```js
import { body, validationResult } from 'express-validator';

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('CIN').trim().notEmpty().withMessage('CIN is required'),
  body('bloodType')
    .optional()
    .isIn(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'])
    .withMessage('Invalid blood type')
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { registerRules, loginRules, validate };
```

# src\validators\donorValidator.js

```js
import { query, validationResult } from 'express-validator';

const filterRules = [
  query('city').optional().trim(),
  query('bloodType')
    .optional()
    .isIn(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'])
    .withMessage('Invalid blood type')
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { filterRules, validate };
```

# src\validators\requestValidator.js

```js
import { body, validationResult } from 'express-validator';

const BLOOD_TYPES = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
const STATUSES = ['ACTIVE', 'FULFILLED', 'CANCELLED'];

const createRequestRules = [
  body('bloodTypeNeeded').isIn(BLOOD_TYPES).withMessage('Invalid blood type'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('hospital').trim().notEmpty().withMessage('Hospital is required'),
  body('reason').optional().trim()
];

const updateStatusRules = [
  body('status').isIn(STATUSES).withMessage('Invalid status value')
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { createRequestRules, updateStatusRules, validate };
```

# tests\auth.test.js

```js
import 'dotenv/config';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

beforeAll(async () => {
  await mongoose.connect("mongodb+srv://ausralia37:b6sZPkmnip8InvoN@cluster0.c8oxb5f.mongodb.net/filRouge");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: '123456',
    CIN: 'AB123456',
    city: 'Rabat',
    bloodType: 'A_POSITIVE'
  };

  let token;

  test('POST /api/auth/register creates a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('POST /api/auth/register rejects a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.statusCode).toBe(409);
  });

  test('POST /api/auth/register rejects invalid data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'not-an-email',
      password: '123'
    });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/login works with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  test('POST /api/auth/login rejects a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword'
    });

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me rejects requests without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me returns the logged-in user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });
});
```

# tests\donors.test.js

```js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

const TEST_DB_URI ="mongodb+srv://ausralia37:b6sZPkmnip8InvoN@cluster0.c8oxb5f.mongodb.net/filRouge";

let token;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);

  const user=await request(app).post('/api/auth/register').send({
    name: 'Donor One',
    email: 'donor1@example.com',
    password: '123456',
    city: 'Casablanca',
    bloodType: 'O_NEGATIVE',
    CIN:"L123456"
  });
 
console.log(user.statusCode);
console.log(user.body);

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'donor1@example.com',
    password: '123456'
  });
  console.log(loginRes.body)

  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Donor search endpoints', () => {
  test('GET /api/donors requires authentication', async () => {
    const res = await request(app).get('/api/donors');

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/donors returns matching donors by city', async () => {
    const res = await request(app)
      .get('/api/donors?city=Casablanca')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/donors rejects an invalid blood type', async () => {
    const res = await request(app)
      .get('/api/donors?bloodType=INVALID')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });
});
```

# tests\requests.test.js

```js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

const TEST_DB_URI ="mongodb+srv://ausralia37:b6sZPkmnip8InvoN@cluster0.c8oxb5f.mongodb.net/filRouge";

let token;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);

  await request(app).post('/api/auth/register').send({
    name: 'Requester One',
    email: 'requester1@example.com',
    password: '123456',
    city: 'Rabat',
    bloodType: 'AB_NEGATIVE',
    CIN:"l12345"
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'requester1@example.com',
    password: '123456'
  });
  console.log(loginRes.body)

  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Blood request endpoints', () => {
  let requestId;

  test('POST /api/requests publishes a new request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bloodTypeNeeded: 'AB_NEGATIVE',
        city: 'Rabat',
        hospital: 'Hopital Ibn Sina',
        reason: 'Surgery'
      });
      console.log(res.body)

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ACTIVE');
    requestId = res.body._id;
  });

  test('POST /api/requests rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ bloodTypeNeeded: 'AB_NEGATIVE' }); // missing city, hospital

    expect(res.statusCode).toBe(400);
  });

  test('GET /api/requests lists active requests', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/requests/:id/compatible-donors returns a list', async () => {
    const res = await request(app)
      .get(`/api/requests/${requestId}/compatible-donors`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PUT /api/requests/:id/status updates status as the owner', async () => {
    const res = await request(app)
      .put(`/api/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'FULFILLED' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('FULFILLED');
  });
}); 
```

