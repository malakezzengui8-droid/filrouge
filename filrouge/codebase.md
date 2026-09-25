# .gitignore

```
node_modules/
.env
*.log
coverage/
.DS_Store
```

# backend\jest.config.js

```js
export default {
  testEnvironment: 'node'
};
```

# backend\package.json

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

# backend\src\app.js

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

# backend\src\config\db.js

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

# backend\src\controllers\adminController.js

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

# backend\src\controllers\appointmentController.js

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

# backend\src\controllers\authController.js

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

# backend\src\controllers\donorController.js

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

# backend\src\controllers\requestController.js

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

# backend\src\middlewares\authMiddleware.js

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

# backend\src\middlewares\errorMiddleware.js

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

# backend\src\middlewares\roleMiddleware.js

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

# backend\src\models\Appointment.js

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

# backend\src\models\BloodRequest.js

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

# backend\src\models\User.js

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

# backend\src\routes\adminRoutes.js

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

# backend\src\routes\appointmentRoutes.js

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

# backend\src\routes\authRoutes.js

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

# backend\src\routes\donorRoutes.js

```js
import express from 'express';
import * as donorController from '../controllers/donorController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { filterRules, validate } from '../validators/donorValidator.js';

const router = express.Router();

router.get('/', protect, filterRules, validate, donorController.getDonors);

export default router;
```

# backend\src\routes\requestRoutes.js

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

# backend\src\server.js

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

# backend\src\services\adminService.js

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

# backend\src\services\appointmentService.js

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

# backend\src\services\authService.js

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

# backend\src\services\donorService.js

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

# backend\src\services\requestService.js

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

# backend\src\utils\compatibility.js

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

# backend\src\utils\eligibility.js

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

# backend\src\utils\generateToken.js

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

# backend\src\validators\appointmentValidator.js

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

# backend\src\validators\authValidator.js

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

# backend\src\validators\donorValidator.js

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

# backend\src\validators\requestValidator.js

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

# backend\tests\auth.test.js

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

# backend\tests\donors.test.js

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

# backend\tests\requests.test.js

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

# frontend\.gitignore

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

```

# frontend\.oxlintrc.json

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}

```

# frontend\index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Blood is Gold</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

# frontend\package.json

```json
{
  "name": "blood-is-gold-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^1.44.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.3"
  },
  "devDependencies": {
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "oxlint": "^1.81.0",
    "vite": "^8.3.0"
  }
}

```

# frontend\public\favicon.svg

This is a file of the type: SVG Image

# frontend\public\icons.svg

This is a file of the type: SVG Image

# frontend\README.md

```md
# Your Blood is Gold — Frontend

A React frontend for the Blood Is Gold blood-donation platform, built against the
backend API described in the handoff doc (`/api` prefix, JWT auth, Mongo-backed
users/requests).

## Stack

- React 19 + Vite
- React Router for pages/navigation
- Plain CSS (no UI framework) — one stylesheet per page/component
- `lucide-react` for icons
- No state library: auth lives in a small React Context, everything else is
  local `useState`/`useEffect`

## Getting started

\`\`\`bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend if not localhost:8080
npm run dev
\`\`\`

The backend must be running separately (see the handoff doc) at the URL in
`VITE_API_URL` (defaults to `http://localhost:8080/api`).

## Project structure

\`\`\`
src/
  api/            fetch wrappers, one file per resource (auth, donors, requests, admin)
  context/        AuthContext — token, current user, login/register/logout
  components/     shared UI: Layout (sidebar), Modal, badges, avatar
  pages/          one file (+ matching .css) per screen
  utils/          blood type labels, city list, date/eligibility helpers
\`\`\`

## Pages

- `/login`, `/register` — auth
- `/dashboard` — donation status, eligibility, nearby urgent requests
- `/donors` — search donors by city/blood type/name
- `/urgent`, `/urgent/new`, `/urgent/:id` — browse, publish and manage blood requests
- `/checklist` — donation preparation checklist (client-side only, no backend)
- `/profile` — view/edit profile, delete account
- `/admin` — admin-only statistics and management tables

## Notes on the API contract

A few things shown in the design mockups aren't available from the documented
API, so the frontend was adapted rather than faking data:

- `GET /api/donors` doesn't return `lastDonationDate`, so donor cards don't show
  an eligibility badge — only name, city, blood type and phone (on request).
- There's no endpoint for total donation count or "lives helped", so the
  dashboard's stat cards show blood type, city and nearby urgent request count
  instead.
- The admin statistics endpoint doesn't return "eligible donors" or "total
  donors" fields, so the admin dashboard uses the real fields: total users,
  active/fulfilled/cancelled requests.
- There's no delete endpoint for requests (only status updates), so the admin
  table's trash icon on requests cancels the request instead of deleting it.
- "Create request" doesn't collect a contact phone — the requester's own
  profile phone is what donors see, per the API's populated `createdBy`.

```

# frontend\src\api\admin.js

```js
import { apiRequest } from "./client";

export const getUsers = (token) => apiRequest("/admin/users", { token });

export const updateUser = (token, id, payload) =>
  apiRequest(`/admin/users/${id}`, { method: "PUT", body: payload, token });

export const deleteUser = (token, id) =>
  apiRequest(`/admin/users/${id}`, { method: "DELETE", token });

export const getAdminRequests = (token) => apiRequest("/admin/requests", { token });

export const updateAdminRequestStatus = (token, id, status) =>
  apiRequest(`/admin/requests/${id}/status`, { method: "PUT", body: { status }, token });

export const getStatistics = (token) => apiRequest("/admin/statistics", { token });

```

# frontend\src\api\appointement.js

```js
import { apiRequest } from "./client";

export const createAppointment = (token, requestId) =>
  apiRequest(`/requests/${requestId}/appointments`, { method: "POST", token });

export const getRequestAppointments = (token, requestId) =>
  apiRequest(`/requests/${requestId}/appointments`, { token });

export const inviteDonor = (token, requestId, donorId) =>
  apiRequest(`/requests/${requestId}/invite`, { method: "POST", body: { donorId }, token });

export const getMyAppointments = (token) => apiRequest("/appointments/me", { token });

export const confirmAppointment = (token, id, payload) =>
  apiRequest(`/appointments/${id}/confirm`, { method: "PUT", body: payload, token });

export const rejectAppointment = (token, id) =>
  apiRequest(`/appointments/${id}/reject`, { method: "PUT", token });

export const cancelAppointment = (token, id) =>
  apiRequest(`/appointments/${id}/cancel`, { method: "PUT", token });

export const completeAppointment = (token, id) =>
  apiRequest(`/appointments/${id}/complete`, { method: "PUT", token });

```

# frontend\src\api\auth.js

```js
import { apiRequest } from "./client";

export const register = (payload) =>
  apiRequest("/auth/register", { method: "POST", body: payload });

export const login = (payload) =>
  apiRequest("/auth/login", { method: "POST", body: payload });

export const getMe = (token) => apiRequest("/auth/me", { token });

export const updateMe = (token, payload) =>
  apiRequest("/auth/me", { method: "PUT", body: payload, token });

export const deleteMe = (token) => apiRequest("/auth/me", { method: "DELETE", token });

export const getEligibility = (token) => apiRequest("/auth/eligibility", { token });

```

# frontend\src\api\client.js

```js
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// One shared request helper: builds headers, attaches the token, and
// throws a normal Error (with .status and .data) on non-2xx responses.
export async function apiRequest(path, { method = "GET", body, token, params } = {}) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || data.errors?.[0]?.msg || "Something went wrong";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

```

# frontend\src\api\donors.js

```js
import { apiRequest } from "./client";

export const searchDonors = (token, { city, bloodType } = {}) =>
  apiRequest("/donors", { token, params: { city, bloodType } });

```

# frontend\src\api\requests.js

```js
import { apiRequest } from "./client";

export const listRequests = (token, { city, bloodType } = {}) =>
  apiRequest("/requests", { token, params: { city, bloodType } });

export const getRequest = (token, id) => apiRequest(`/requests/${id}`, { token });

export const getMyRequests = (token) => apiRequest("/requests/me", { token });

export const createRequest = (token, payload) =>
  apiRequest("/requests", { method: "POST", body: payload, token });

export const getCompatibleDonors = (token, id) =>
  apiRequest(`/requests/${id}/compatible-donors`, { token });

export const updateRequestStatus = (token, id, status) =>
  apiRequest(`/requests/${id}/status`, { method: "PUT", body: { status }, token });

```

# frontend\src\App.jsx

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Donors from "./pages/Donors";
import Urgent from "./pages/Urgent";
import CreateRequest from "./pages/CreateRequest";
import MyRequests from "./pages/MyRequests";
import RequestDetails from "./pages/RequestDetails";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function WithLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <Dashboard />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donors"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <Donors />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <Urgent />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent/new"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <CreateRequest />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent/mine"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <MyRequests />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent/:id"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <RequestDetails />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <MyAppointments />
                </WithLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <Profile />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <WithLayout>
                  <AdminDashboard />
                </WithLayout>
              </AdminRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

# frontend\src\components\AppointmentConfirmModal.jsx

```jsx
import { useState } from "react";
import Modal from "./Modal";

export default function AppointmentConfirmModal({ title, onClose, onConfirm }) {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!appointmentDate) {
      setError("Please pick a date and time");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onConfirm({ appointmentDate, location });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="appointmentDate">Date &amp; time</label>
          <input
            id="appointmentDate"
            type="datetime-local"
            value={appointmentDate}
            onChange={(event) => setAppointmentDate(event.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            placeholder="e.g. CHU Ibn Rochd, blood bank"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="profile-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm appointment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
```

# frontend\src\components\BloodTypeAvatar.css

```css
.blood-avatar {
  background: var(--gold-bg);
  color: var(--red-dark);
  font-family: var(--font-heading);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.blood-avatar-sm {
  width: 34px;
  height: 34px;
  font-size: 0.85rem;
  border-radius: 9px;
}

.blood-avatar-md {
  width: 56px;
  height: 56px;
  font-size: 1.25rem;
}

```

# frontend\src\components\BloodTypeAvatar.jsx

```jsx
import { toShortBloodType } from "../utils/bloodTypes";
import "./BloodTypeAvatar.css";

export default function BloodTypeAvatar({ bloodType, size = "md" }) {
  return (
    <div className={`blood-avatar blood-avatar-${size}`}>{toShortBloodType(bloodType)}</div>
  );
}

```

# frontend\src\components\InviteToRequestModal.jsx

```jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyRequests } from "../api/requests";
import { inviteDonor } from "../api/appointement";
import { canDonateTo, toShortBloodType } from "../utils/bloodTypes";
import Modal from "./Modal";

export default function InviteToRequestModal({ donor, onClose, onSent }) {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    getMyRequests(token)
      .then((data) =>
        setRequests(
          data.filter(
            (request) =>
              request.status === "ACTIVE" && canDonateTo(donor.bloodType, request.bloodTypeNeeded)
          )
        )
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, donor.bloodType]);

  async function handleSend(requestId) {
    setSendingId(requestId);
    setError("");
    try {
      await inviteDonor(token, requestId, donor._id);
      onSent();
    } catch (err) {
      setError(err.message);
      setSendingId(null);
    }
  }

  return (
    <Modal title={`Send a request to ${donor.name}`} onClose={onClose}>
      {loading && <p className="form-hint">Loading your requests...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && requests.length === 0 && (
        <p className="form-hint">
          You don't have an active request compatible with this donor.
        </p>
      )}

      {!loading && requests.length > 0 && (
        <div className="my-appointments-list">
          {requests.map((request) => (
            <div className="appointment-row" key={request._id}>
              <div>
                <p className="compatible-donor-name">
                  {toShortBloodType(request.bloodTypeNeeded)} needed
                </p>
                <p className="compatible-donor-meta">
                  {request.hospital} · {request.city}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={sendingId === request._id}
                onClick={() => handleSend(request._id)}
              >
                {sendingId === request._id ? "Sending..." : "Send"}
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

```

# frontend\src\components\Layout.css

```css
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 1.6rem 1rem;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.4rem 1.6rem;
}

.sidebar-logo-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--red);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-logo-text {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.2;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  color: var(--text-muted);
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.sidebar-link:hover {
  background: var(--bg);
  color: var(--text);
}

.sidebar-link.active {
  background: var(--gold-bg);
  color: var(--gold-text);
  font-weight: 600;
}

.sidebar-link-button {
  cursor: pointer;
}

.sidebar-divider {
  height: 1px;
  background: var(--border);
  margin: 1rem 0.4rem;
}

.page {
  flex: 1;
  padding: 2.6rem 3rem;
  min-width: 0;
}

@media (max-width: 860px) {
  .sidebar {
    width: 76px;
    padding: 1.4rem 0.5rem;
  }
  .sidebar-logo-text,
  .sidebar-link span {
    display: none;
  }
  .sidebar-link {
    justify-content: center;
  }
  .page {
    padding: 1.6rem;
  }
}

```

# frontend\src\components\Layout.jsx

```jsx
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  BellRing,
  Send,
  ShieldCheck,
  User,
  LogOut,
  Droplet,
  CalendarCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/donors", label: "Donors", icon: Users },
  { to: "/urgent", label: "Urgent", icon: BellRing },
  { to: "/appointments", label: "appointement", icon: CalendarCheck },
  { to: "/urgent/mine", label: "my Requests", icon: Send }
];

export default function Layout({ children }) {
  const { isAdmin, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">
            <Droplet size={16} strokeWidth={0} fill="currentColor" />
          </span>
          <span className="sidebar-logo-text">
            Your Blood
            <br />
            is Gold
          </span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <ShieldCheck size={17} />
              <span>Admin view</span>
            </NavLink>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <User size={17} />
            <span>Profile</span>
          </NavLink>
          <button type="button" className="sidebar-link sidebar-link-button" onClick={logout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="page">{children}</main>
    </div>
  );
}

```

# frontend\src\components\Modal.css

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(34, 29, 25, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
}

.modal-content {
  width: 100%;
  max-width: 380px;
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
}

```

# frontend\src\components\Modal.jsx

```jsx
import { X } from "lucide-react";
import "./Modal.css";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

```

# frontend\src\components\ProtectedRoute.jsx

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}

```

# frontend\src\components\StatusBadge.jsx

```jsx
const REQUEST_STATUS = {
  ACTIVE: { label: "Urgent", className: "badge-red" },
  FULFILLED: { label: "Fulfilled", className: "badge-grey" },
  CANCELLED: { label: "Cancelled", className: "badge-grey" },
};

export function RequestStatusBadge({ status }) {
  const { label, className } = REQUEST_STATUS[status] || REQUEST_STATUS.ACTIVE;
  return <span className={`badge ${className}`}>{label}</span>;
}

export function EligibilityBadge({ eligible }) {
  return (
    <span className={`badge ${eligible ? "badge-green" : "badge-grey"}`}>
      {eligible ? "Eligible" : "Not eligible yet"}
    </span>
  );
}

const APPOINTMENT_STATUS = {
  PENDING: { label: "Pending", className: "badge-gold" },
  CONFIRMED: { label: "Confirmed", className: "badge-green" },
  REJECTED: { label: "Rejected", className: "badge-grey" },
  COMPLETED: { label: "Completed", className: "badge-green" },
  CANCELLED: { label: "Cancelled", className: "badge-grey" },
};

export function AppointmentStatusBadge({ status }) {
  const { label, className } = APPOINTMENT_STATUS[status] || APPOINTMENT_STATUS.PENDING;
  return <span className={`badge ${className}`}>{label}</span>;
}
```

# frontend\src\context\AuthContext.jsx

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, fetch the full profile.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function handleAuthSuccess({ token: newToken, user: newUser }) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function login(credentials) {
    const data = await authApi.login(credentials);
    handleAuthSuccess(data);
    return data;
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    handleAuthSuccess(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  function updateUserLocally(patch) {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }

  const value = {
    token,
    user,
    loading,
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
    updateUserLocally,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}

```

# frontend\src\index.css

```css
:root {
  --bg: #f8f5ee;
  --surface: #ffffff;
  --border: #e9e2d3;
  --text: #221d19;
  --text-muted: #918a7b;

  --red: #7c1e1e;
  --red-dark: #631515;
  --red-soft-bg: #fbe7e4;
  --red-soft-text: #b23c3c;

  --gold-bg: #f1e2ac;
  --gold-text: #6a4a16;

  --green-bg: #ddeee0;
  --green-text: #2f7a4f;

  --grey-bg: #efe9dc;
  --grey-text: #948d7d;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;

  --shadow-card: 0 1px 2px rgba(34, 29, 25, 0.04);

  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3 {
  font-family: var(--font-heading);
  font-weight: 600;
  margin: 0;
  color: var(--text);
}

p {
  margin: 0;
}

button {
  font-family: inherit;
  cursor: pointer;
}

input,
select,
textarea {
  font-family: inherit;
  font-size: 0.95rem;
}

a {
  color: inherit;
  text-decoration: none;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}

.btn {
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.65rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: opacity 0.15s ease;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--red);
  color: #fff;
}

.btn-secondary {
  background: var(--grey-bg);
  color: var(--text);
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-danger-outline {
  background: #fff;
  border: 1px solid var(--red);
  color: var(--red);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge-red {
  background: var(--red-soft-bg);
  color: var(--red-soft-text);
}

.badge-green {
  background: var(--green-bg);
  color: var(--green-text);
}

.badge-grey {
  background: var(--grey-bg);
  color: var(--grey-text);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
}

.form-field textarea {
  resize: vertical;
  min-height: 80px;
}

.error-text {
  color: var(--red);
  font-size: 0.85rem;
  margin-top: -0.3rem;
  margin-bottom: 0.8rem;
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.page-loading {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
}
.badge-gold {
  background: var(--gold-bg);
  color: var(--gold-text);
}
```

# frontend\src\main.jsx

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

```

# frontend\src\pages\Admin.css

```css
.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 1.4rem 0 2rem;
}

.admin-stat {
  padding: 1.1rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.admin-section-title {
  font-size: 1rem;
  margin: 1.6rem 0 0.8rem;
}

.admin-table-card {
  padding: 0.4rem 0.6rem;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  text-align: left;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  padding: 0.7rem 0.8rem;
  border-bottom: 1px solid var(--border);
}

.admin-table td {
  padding: 0.7rem 0.8rem;
  font-size: 0.88rem;
  border-bottom: 1px solid var(--border);
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 1.6rem;
}

.admin-row-actions {
  display: flex;
  gap: 0.5rem;
}

.admin-row-actions button {
  border: none;
  background: transparent;
  color: var(--text-muted);
  display: flex;
  padding: 0.3rem;
  border-radius: 6px;
}

.admin-row-actions button:hover {
  background: var(--bg);
  color: var(--text);
}

.admin-row-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 860px) {
  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

```

# frontend\src\pages\AdminDashboard.jsx

```jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getStatistics,
  getAdminRequests,
  getUsers,
  deleteUser,
  updateAdminRequestStatus,
} from "../api/admin";
import { RequestStatusBadge, EligibilityBadge } from "../components/StatusBadge";
import Modal from "../components/Modal";
import { toShortBloodType } from "../utils/bloodTypes";
import { computeEligibility } from "../utils/dates";
import "./Admin.css";

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingUser, setViewingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, [token]);

  function loadData() {
    setLoading(true);
    setError("");
    Promise.all([getStatistics(token), getAdminRequests(token), getUsers(token)])
      .then(([statsData, requestData, userData]) => {
        setStats(statsData);
        setRequests(requestData.slice(0, 8));
        setDonors(userData.filter((u) => u.role === "USER").slice(0, 10));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleCancelRequest(id) {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await updateAdminRequestStatus(token, id, "CANCELLED");
      setRequests((current) =>
        current.map((r) => (r._id === id ? { ...r, status: "CANCELLED" } : r))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(token, id);
      setDonors((current) => current.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page-loading">Loading admin dashboard...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p className="page-subtitle">Oversight across donors and requests.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="admin-stats">
        <div className="card admin-stat">
          <span className="stat-value">{stats?.totalUsers ?? "—"}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="card admin-stat">
          <span className="stat-value">{stats?.activeRequests ?? "—"}</span>
          <span className="stat-label">Active Requests</span>
        </div>
        <div className="card admin-stat">
          <span className="stat-value">{stats?.fulfilledRequests ?? "—"}</span>
          <span className="stat-label">Fulfilled Requests</span>
        </div>
        <div className="card admin-stat">
          <span className="stat-value">{stats?.cancelledRequests ?? "—"}</span>
          <span className="stat-label">Cancelled Requests</span>
        </div>
      </div>

      <h3 className="admin-section-title">Recent urgent requests</h3>
      <div className="card admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Blood type</th>
              <th>Hospital</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id}>
                <td>{toShortBloodType(request.bloodTypeNeeded)}</td>
                <td>{request.hospital}</td>
                <td>{request.city}</td>
                <td>
                  <RequestStatusBadge status={request.status} />
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      title="View"
                      onClick={() => navigate(`/urgent/${request._id}`)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      title="Cancel request"
                      disabled={request.status !== "ACTIVE"}
                      onClick={() => handleCancelRequest(request._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="admin-section-title">Recent donors</h3>
      <div className="card admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Blood type</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor._id}>
                <td>{donor.name}</td>
                <td>{toShortBloodType(donor.bloodType)}</td>
                <td>{donor.city || "—"}</td>
                <td>
                  <EligibilityBadge eligible={computeEligibility(donor.lastDonationDate).eligible} />
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button type="button" title="View" onClick={() => setViewingUser(donor)}>
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      title="Delete user"
                      onClick={() => handleDeleteUser(donor._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {donors.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  No donors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingUser && (
        <Modal title={viewingUser.name} onClose={() => setViewingUser(null)}>
          <p className="modal-row">
            <span>Email</span>
            {viewingUser.email}
          </p>
          <p className="modal-row">
            <span>Phone</span>
            {viewingUser.phone || "—"}
          </p>
          <p className="modal-row">
            <span>City</span>
            {viewingUser.city || "—"}
          </p>
          <p className="modal-row">
            <span>Blood type</span>
            {toShortBloodType(viewingUser.bloodType)}
          </p>
        </Modal>
      )}
    </div>
  );
}

```

# frontend\src\pages\Auth.css

```css
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2.4rem;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.8rem;
}

.auth-logo-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--red);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-logo-text {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.2;
}

.auth-card h1 {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
}

.auth-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.6rem;
}

.auth-card .btn-primary {
  width: 100%;
  justify-content: center;
  padding: 0.75rem;
  margin-top: 0.3rem;
}

.auth-switch {
  text-align: center;
  margin-top: 1.4rem;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.auth-switch a {
  color: var(--red);
  font-weight: 600;
}

.auth-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

```

# frontend\src\pages\Checklist.css

```css

```

# frontend\src\pages\Checklist.jsx

```jsx


```

# frontend\src\pages\CreateRequest.jsx

```jsx
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createRequest } from "../api/requests";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import { CITIES } from "../utils/cities";
import "./Urgent.css";

const initialForm = { bloodTypeNeeded: "", city: "", hospital: "", reason: "" };

export default function CreateRequest() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await createRequest(token, form);
      navigate(`/urgent/${created._id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button type="button" className="back-link" onClick={() => navigate("/urgent")}>
        <ArrowLeft size={15} />
        Back to requests
      </button>

      <h1>Create an Urgent Request</h1>
      <p className="page-subtitle">Share the details so nearby donors can respond.</p>

      <div className="card request-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="bloodTypeNeeded">Blood type needed</label>
            <select
              id="bloodTypeNeeded"
              name="bloodTypeNeeded"
              required
              value={form.bloodTypeNeeded}
              onChange={handleChange}
            >
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {toShortBloodType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="city">City</label>
            <select id="city" name="city" required value={form.city} onChange={handleChange}>
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="hospital">Hospital</label>
            <input
              id="hospital"
              name="hospital"
              required
              placeholder="e.g. CHU Ibn Rochd"
              value={form.hospital}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              placeholder="Briefly describe the situation"
              value={form.reason}
              onChange={handleChange}
            />
          </div>
          <p className="form-hint">
            Donors will see the phone number on your profile, so make sure it's up to date.
          </p>

          {error && <p className="error-text">{error}</p>}

          <div className="request-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/urgent")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

```

# frontend\src\pages\Dashboard.css

```css
.page-subtitle {
  color: var(--text-muted);
  margin-top: 0.3rem;
}

.dashboard-top {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.2rem;
  margin-top: 1.6rem;
}

.status-card {
  padding: 1.6rem 1.8rem;
}

.status-label {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.status-headline {
  font-size: 1.4rem;
  margin-top: 0.2rem;
}

.status-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-top: 1.4rem;
}

.status-dates {
  display: flex;
  gap: 2.2rem;
}

.status-dates > div {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.status-date-label {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.status-date-value {
  font-weight: 600;
  font-size: 0.95rem;
}

.status-ring {
  --progress: 0%;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: conic-gradient(var(--gold-bg) var(--progress), var(--border) var(--progress));
  position: relative;
}

.status-ring::before {
  content: "";
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  background: var(--surface);
}

.status-ring-value {
  position: relative;
  font-weight: 700;
  font-size: 1rem;
}

.status-ring-label {
  position: relative;
  font-size: 0.62rem;
  color: var(--text-muted);
  text-align: center;
  padding: 0 4px;
}

.dashboard-stats {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.stat-card {
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.dashboard-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 2rem 0 1rem;
}

.dashboard-section-header h3 {
  font-size: 1.1rem;
}

.dashboard-section-header a {
  color: var(--red);
  font-size: 0.88rem;
  font-weight: 600;
}

.dashboard-requests {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.mini-request-card {
  padding: 1.1rem 1.2rem;
}

.mini-request-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mini-request-type {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--red);
}

.mini-request-title {
  font-weight: 600;
  margin-top: 0.7rem;
}

.mini-request-meta {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.mini-request-link {
  display: inline-block;
  margin-top: 0.7rem;
  color: var(--red);
  font-size: 0.85rem;
  font-weight: 600;
}

.dashboard-banner {
  margin-top: 1.8rem;
  background: var(--red);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  color: #fff;
}

.banner-title {
  font-size: 1.05rem;
  font-weight: 600;
}

.banner-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.btn-banner {
  background: #fff;
  color: var(--red);
  white-space: nowrap;
}

@media (max-width: 860px) {
  .dashboard-top,
  .dashboard-requests {
    grid-template-columns: 1fr;
  }
  .status-body {
    flex-direction: column;
    align-items: flex-start;
  }
  .dashboard-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}

```

# frontend\src\pages\Dashboard.jsx

```jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEligibility } from "../api/auth";
import { listRequests } from "../api/requests";
import { DONATION_INTERVAL_DAYS, formatDate } from "../utils/dates";
import { toShortBloodType } from "../utils/bloodTypes";
import "./Dashboard.css";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [eligibility, setEligibility] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([getEligibility(token), listRequests(token, { city: user?.city })])
      .then(([eligibilityData, requestData]) => {
        if (ignore) return;
        setEligibility(eligibilityData);
        setRequests(requestData.slice(0, 3));
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token, user?.city]);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const daysSinceLast = eligibility?.lastDonationDate
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(eligibility.lastDonationDate).getTime()) / 86400000)
      )
    : null;

  const progressPercent = eligibility?.eligible
    ? 100
    : Math.min(100, Math.round(((daysSinceLast ?? 0) / DONATION_INTERVAL_DAYS) * 100));

  return (
    <div>
      <h1>
        {greeting()}, {user?.name?.split(" ")[0]} 👋
      </h1>
      <p className="page-subtitle">Every donation can save a life.</p>

      <div className="dashboard-top">
        <div className="card status-card">
          <p className="status-label">Your donation status</p>
          <h2 className="status-headline">
            {eligibility?.eligible ? "You're eligible today!" : "Not eligible just yet"}
          </h2>

          <div className="status-body">
            <div className="status-dates">
              <div>
                <span className="status-date-label">Last donation</span>
                <span className="status-date-value">{formatDate(eligibility?.lastDonationDate)}</span>
              </div>
              <div>
                <span className="status-date-label">Next donation</span>
                <span className="status-date-value">
                  {eligibility?.eligible ? "Today" : formatDate(eligibility?.nextDonationDate)}
                </span>
              </div>
              <div>
                <span className="status-date-label">Status</span>
                <span
                  className={`badge ${eligibility?.eligible ? "badge-green" : "badge-grey"}`}
                >
                  {eligibility?.eligible ? "Eligible" : "Not eligible yet"}
                </span>
              </div>
            </div>

            <div className="status-ring" style={{ "--progress": `${progressPercent}%` }}>
              <span className="status-ring-value">{progressPercent}%</span>
              <span className="status-ring-label">
                {eligibility?.eligible ? "Ready to donate" : "Until eligible"}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="card stat-card">
            <span className="stat-value">{toShortBloodType(user?.bloodType) || "—"}</span>
            <span className="stat-label">Blood type</span>
          </div>
          <div className="card stat-card">
            <span className="stat-value">{user?.city || "—"}</span>
            <span className="stat-label">City</span>
          </div>
          <div className="card stat-card">
            <span className="stat-value">{requests.length}</span>
            <span className="stat-label">Urgent requests near you</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section-header">
        <h3>Urgent requests near you</h3>
        <Link to="/urgent">See all</Link>
      </div>

      {requests.length === 0 ? (
        <div className="card empty-state">No urgent requests near you right now.</div>
      ) : (
        <div className="dashboard-requests">
          {requests.map((request) => (
            <div className="card mini-request-card" key={request._id}>
              <div className="mini-request-top">
                <span className="mini-request-type">{toShortBloodType(request.bloodTypeNeeded)}</span>
                <span className="badge badge-red">Urgent</span>
              </div>
              <p className="mini-request-title">Blood needed</p>
              <p className="mini-request-meta">
                {request.city} · {request.hospital}
              </p>
              <Link className="mini-request-link" to={`/urgent/${request._id}`}>
                View request
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-banner">
        <div>
          <p className="banner-title">Your blood is more valuable than you think.</p>
          <p className="banner-subtitle">One donation can help up to three people in need.</p>
        </div>
        <button className="btn btn-banner" onClick={() => navigate("/donors")}>
          Find someone to help
        </button>
      </div>
    </div>
  );
}

```

# frontend\src\pages\Donors.css

```css
.donors-filters {
  display: flex;
  gap: 0.8rem;
  margin: 1.6rem 0 1.8rem;
}

.donors-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.9rem;
  color: var(--text-muted);
}

.donors-search input {
  border: none;
  background: transparent;
  width: 100%;
  color: var(--text);
}

.donors-filters select {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.9rem;
  background: var(--surface);
  color: var(--text);
  min-width: 150px;
}

.donors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.donor-card {
  padding: 1.1rem 1.2rem;
}

.donor-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
}

.donor-name {
  font-weight: 600;
}

.donor-city {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.1rem;
}

.donor-view-btn {
  width: 100%;
  justify-content: center;
}

.modal-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
  font-weight: 500;
}

.modal-row span {
  color: var(--text-muted);
  font-weight: 400;
}

.modal-row:last-child {
  border-bottom: none;
}

@media (max-width: 860px) {
  .donors-filters {
    flex-direction: column;
  }
  .donors-grid {
    grid-template-columns: 1fr;
  }
}
.donor-card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

```

# frontend\src\pages\Donors.jsx

```jsx
import { useEffect, useState } from "react";
import { Search, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { searchDonors } from "../api/donors";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import { CITIES } from "../utils/cities";
import { formatDate, computeEligibility } from "../utils/dates";
import { EligibilityBadge } from "../components/StatusBadge";
import Modal from "../components/Modal";
import InviteToRequestModal from "../components/InviteToRequestModal";
import "./Donors.css";

export default function Donors() {
  const { token } = useAuth();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [invitingDonor, setInvitingDonor] = useState(null);
  const [sentMessage, setSentMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    searchDonors(token, { city, bloodType })
      .then((data) => !ignore && setDonors(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token, city, bloodType]);

  const visibleDonors = donors.filter((donor) =>
    donor.name.toLowerCase().includes(name.trim().toLowerCase())
  );

  return (
    <div>
      <h1>Find a Donor</h1>
      <p className="page-subtitle">Connect with people who may be able to help.</p>

      <div className="donors-filters">
        <div className="donors-search">
          <Search size={16} />
          <input
            placeholder="Search by name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <select value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={bloodType} onChange={(event) => setBloodType(event.target.value)}>
          <option value="">All blood types</option>
          {BLOOD_TYPES.map((type) => (
            <option key={type} value={type}>
              {toShortBloodType(type)}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="page-loading">Searching donors...</div>}
      {error && <p className="error-text">{error}</p>}
      {sentMessage && (
        <p className="form-hint" style={{ color: "var(--green-text)" }}>
          {sentMessage}
        </p>
      )}

      {!loading && !error && visibleDonors.length === 0 && (
        <div className="card empty-state">No donors match your search yet.</div>
      )}

      {!loading && !error && visibleDonors.length > 0 && (
        <div className="donors-grid">
          {visibleDonors.map((donor) => {
            const { eligible } = computeEligibility(donor.lastDonationDate);
            return (
              <div className="card donor-card" key={donor._id}>
                <div className="donor-card-top">
                  <div className="donor-header">
                    <div className="donor-avatar">
                      <UserIcon size={22} />
                    </div>
                    <div>
                      <p className="donor-name">{donor.name}</p>
                      <p className="donor-city">{donor.city || "—"}</p>
                    </div>
                  </div>
                  <span className="badge badge-red">{toShortBloodType(donor.bloodType)}</span>
                </div>

                <p className="donor-last-donation">
                  Last donation: <strong>{formatDate(donor.lastDonationDate)}</strong>
                </p>

                <EligibilityBadge eligible={eligible} />

                <div className="donor-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary donor-view-btn"
                    onClick={() => setSelectedDonor(donor)}
                  >
                    View profile
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary donor-view-btn"
                    disabled={!eligible}
                    onClick={() => setInvitingDonor(donor)}
                  >
                    {eligible ? "Send request" : "Not eligible"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDonor && (
        <Modal title={selectedDonor.name} onClose={() => setSelectedDonor(null)}>
          <p className="modal-row">
            <span>City</span>
            {selectedDonor.city || "—"}
          </p>
          <p className="modal-row">
            <span>Blood type</span>
            {toShortBloodType(selectedDonor.bloodType)}
          </p>
          <p className="modal-row">
            <span>Last donation</span>
            {formatDate(selectedDonor.lastDonationDate)}
          </p>
          <p className="modal-row">
            <span>Phone</span>
            {selectedDonor.phone || "Not shared"}
          </p>
        </Modal>
      )}

      {invitingDonor && (
        <InviteToRequestModal
          donor={invitingDonor}
          onClose={() => setInvitingDonor(null)}
          onSent={() => {
            setInvitingDonor(null);
            setSentMessage(`Request sent to ${invitingDonor.name}!`);
            setTimeout(() => setSentMessage(""), 4000);
          }}
        />
      )}
    </div>
  );
}

```

# frontend\src\pages\Login.jsx

```jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Droplet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">
            <Droplet size={17} strokeWidth={0} fill="currentColor" />
          </span>
          <span className="auth-logo-text">
            Your Blood
            <br />
            is Gold
          </span>
        </div>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to find donors and urgent requests.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

```

# frontend\src\pages\MyAppointments.css

```css
.section-title {
  font-size: 1rem;
  margin: 1.6rem 0 0.8rem;
}

.my-appointments-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.my-appointment-card {
  padding: 1.1rem 1.3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.my-appointment-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.my-appointment-type {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--red);
  min-width: 46px;
}

.my-appointment-title {
  font-weight: 600;
}

.my-appointment-meta {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

@media (max-width: 860px) {
  .my-appointment-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

# frontend\src\pages\MyAppointments.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as appointmentsApi from "../api/appointement";
import { AppointmentStatusBadge } from "../components/StatusBadge";
import AppointmentConfirmModal from "../components/AppointmentConfirmModal";
import { formatDate } from "../utils/dates";
import { toShortBloodType } from "../utils/bloodTypes";
import "./MyAppointments.css";

export default function MyAppointments() {
  const { token } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingAppointment, setActingAppointment] = useState(null);

  useEffect(() => {
    load();
  }, [token]);

  function load() {
    setLoading(true);
    setError("");
    appointmentsApi
      .getMyAppointments(token)
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleConfirm({ appointmentDate, location }) {
    const updated = await appointmentsApi.confirmAppointment(token, actingAppointment._id, {
      appointmentDate,
      location,
    });
    setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    setActingAppointment(null);
  }

  async function handleReject(appointmentId) {
    try {
      const updated = await appointmentsApi.rejectAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(appointmentId) {
    try {
      const updated = await appointmentsApi.cancelAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page-loading">Loading your appointments...</div>;

  // Invitations sent TO me by requesters — I need to accept/decline
  const invitationsReceived = appointments.filter((a) => a.initiatedBy === "REQUESTER");
  // Offers I made myself — the requester decides, I just track status
  const myOffers = appointments.filter((a) => a.initiatedBy === "DONOR");

  return (
    <div>
      <h1>My Appointments</h1>
      <p className="page-subtitle">Invitations you received and offers you made.</p>

      {error && <p className="error-text">{error}</p>}

      <h3 className="section-title">Invitations received</h3>
      {invitationsReceived.length === 0 ? (
        <div className="card empty-state">No invitations yet.</div>
      ) : (
        <div className="my-appointments-list">
          {invitationsReceived.map((appointment) => (
            <div className="card my-appointment-card" key={appointment._id}>
              <div className="my-appointment-main">
                <span className="my-appointment-type">
                  {toShortBloodType(appointment.request?.bloodTypeNeeded)}
                </span>
                <div>
                  <p className="my-appointment-title">
                    {appointment.request?.hospital} · {appointment.request?.city}
                  </p>
                  {["CONFIRMED", "COMPLETED"].includes(appointment.status) && (
                    <p className="my-appointment-meta">
                      {formatDate(appointment.appointmentDate)}
                      {appointment.location ? ` · ${appointment.location}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {appointment.status === "PENDING" ? (
                <div className="appointment-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleReject(appointment._id)}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setActingAppointment(appointment)}
                  >
                    Accept
                  </button>
                </div>
              ) : (
                <div className="appointment-actions">
                  <AppointmentStatusBadge status={appointment.status} />
                  {appointment.status === "CONFIRMED" && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3 className="section-title">Offers I made</h3>
      {myOffers.length === 0 ? (
        <div className="card empty-state">
          You haven't offered to help anyone yet. <Link to="/urgent">Browse urgent requests</Link>.
        </div>
      ) : (
        <div className="my-appointments-list">
          {myOffers.map((appointment) => (
            <div className="card my-appointment-card" key={appointment._id}>
              <div className="my-appointment-main">
                <span className="my-appointment-type">
                  {toShortBloodType(appointment.request?.bloodTypeNeeded)}
                </span>
                <div>
                  <p className="my-appointment-title">
                    {appointment.request?.hospital} · {appointment.request?.city}
                  </p>
                  {["CONFIRMED", "COMPLETED"].includes(appointment.status) && (
                    <p className="my-appointment-meta">
                      {formatDate(appointment.appointmentDate)}
                      {appointment.location ? ` · ${appointment.location}` : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="appointment-actions">
                <AppointmentStatusBadge status={appointment.status} />
                {appointment.status === "CONFIRMED" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleCancel(appointment._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {actingAppointment && (
        <AppointmentConfirmModal
          title="Confirm appointment"
          onClose={() => setActingAppointment(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

```

# frontend\src\pages\MyRequests.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyRequests } from "../api/requests";
import { RequestStatusBadge } from "../components/StatusBadge";
import BloodTypeAvatar from "../components/BloodTypeAvatar";
import { formatRelative } from "../utils/dates";
import "./Urgent.css";

export default function MyRequests() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getMyRequests(token)
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div className="urgent-header">
        <div>
          <h1>My Requests</h1>
          <p className="page-subtitle">All the blood requests you've published.</p>
        </div>
        <Link to="/urgent/new" className="btn btn-primary">
          <Plus size={16} />
          New Request
        </Link>
      </div>

      {loading && <div className="page-loading">Loading your requests...</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <div className="card empty-state">
          You haven't published any request yet. <Link to="/urgent/new">Create one</Link>.
        </div>
      )}

      <div className="urgent-list">
        {requests.map((request) => (
          <div className="card urgent-card" key={request._id}>
            <BloodTypeAvatar bloodType={request.bloodTypeNeeded} />
            <div className="urgent-card-body">
              <div className="urgent-card-top">
                <RequestStatusBadge status={request.status} />
              </div>
              <p className="urgent-card-title">Blood needed</p>
              <p className="urgent-card-meta">
                {request.hospital} · {request.city}
              </p>
              {request.reason && <p className="urgent-card-reason">{request.reason}</p>}
            </div>
            <div className="urgent-card-side">
              <span className="urgent-card-time">Posted: {formatRelative(request.createdAt)}</span>
              <Link className="btn btn-secondary" to={`/urgent/${request._id}`}>
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

# frontend\src\pages\Profile.css

```css
.profile-card {
  max-width: 620px;
  padding: 1.8rem 2rem;
  margin-top: 1.4rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.6rem;
}

.profile-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--gold-bg);
  color: var(--gold-text);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-name {
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1.2rem;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 0.4rem;
}

.danger-card {
  max-width: 620px;
  margin-top: 1.2rem;
  padding: 1.2rem 1.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--red-soft-bg);
  border-color: var(--red-soft-bg);
}

.danger-title {
  font-weight: 600;
  color: var(--red-soft-text);
}

.danger-subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

@media (max-width: 860px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  .danger-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

```

# frontend\src\pages\Profile.jsx

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateMe, deleteMe } from "../api/auth";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import { CITIES } from "../utils/cities";
import { formatDate } from "../utils/dates";
import Modal from "../components/Modal";
import "./Profile.css";

export default function Profile() {
  const { user, token, updateUserLocally, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: user?.phone || "",
    city: user?.city || "",
    bloodType: user?.bloodType || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await updateMe(token, form);
      updateUserLocally(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMe(token);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1>My Profile</h1>

      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{user?.name?.[0]}</div>
          <div>
            <p className="profile-name">{user?.name}</p>
            <span className="badge badge-red">{toShortBloodType(user?.bloodType)}</span>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="profile-grid">
            <div className="form-field">
              <label>Email</label>
              <input value={user?.email || ""} disabled />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="+212 6 XX XX XX XX"
              />
            </div>
            <div className="form-field">
              <label>City</label>
              {editing ? (
                <select name="city" value={form.city} onChange={handleChange}>
                  <option value="">Select city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={user?.city || ""} disabled />
              )}
            </div>
            <div className="form-field">
              <label>Blood type</label>
              {editing ? (
                <select name="bloodType" value={form.bloodType} onChange={handleChange}>
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {toShortBloodType(type)}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={toShortBloodType(user?.bloodType)} disabled />
              )}
            </div>
            <div className="form-field">
              <label>Last donation</label>
              <input value={formatDate(user?.lastDonationDate)} disabled />
              <span className="form-hint">Updated automatically after a completed donation.</span>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="profile-actions">
            {editing ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card danger-card">
        <div>
          <p className="danger-title">Delete account</p>
          <p className="danger-subtitle">
            This permanently removes your profile and donation history.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-danger-outline"
          onClick={() => setConfirmingDelete(true)}
        >
          Delete account
        </button>
      </div>

      {confirmingDelete && (
        <Modal title="Delete your account?" onClose={() => setConfirmingDelete(false)}>
          <p className="form-hint">
            This can't be undone. Your profile will be permanently removed.
          </p>
          <div className="profile-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

```

# frontend\src\pages\Register.jsx

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import "./Auth.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  CIN: "",
  phone: "",
  city: "",
  bloodType: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">
            <Droplet size={17} strokeWidth={0} fill="currentColor" />
          </span>
          <span className="auth-logo-text">
            Your Blood
            <br />
            is Gold
          </span>
        </div>

        <h1>Create your account</h1>
        <p className="auth-subtitle">Join as a donor and help someone in need.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="form-field">
            <label htmlFor="CIN">CIN</label>
            <input id="CIN" name="CIN" required value={form.CIN} onChange={handleChange} />
          </div>
          <div className="auth-row">
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="city">City</label>
              <input id="city" name="city" value={form.city} onChange={handleChange} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="bloodType">Blood type</label>
            <select id="bloodType" name="bloodType" value={form.bloodType} onChange={handleChange}>
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {toShortBloodType(type)}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

```

# frontend\src\pages\RequestDetails.jsx

```jsx
import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getRequest,
  getCompatibleDonors,
  updateRequestStatus,
} from "../api/requests";
import * as appointmentsApi from "../api/appointement";
import { RequestStatusBadge, AppointmentStatusBadge } from "../components/StatusBadge";
import BloodTypeAvatar from "../components/BloodTypeAvatar";
import AppointmentConfirmModal from "../components/AppointmentConfirmModal";
import { computeEligibility, formatDate } from "../utils/dates";
import { canDonateTo, toShortBloodType } from "../utils/bloodTypes";
import "./Urgent.css";

export default function RequestDetails() {
  const { id } = useParams();
  const { token, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [donors, setDonors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const [myOffer, setMyOffer] = useState(null); // this donor's own offer on this request, if any
  const [applying, setApplying] = useState(false);
  const [invitingDonorId, setInvitingDonorId] = useState(null);
  const [actingAppointment, setActingAppointment] = useState(null); // { appointment, mode: 'confirm' }

  const userId = user?._id || user?.id;
  const canManage = isAdmin || request?.createdBy?._id === userId;

  useEffect(() => {
    load();
  }, [token, id]);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getRequest(token, id), getCompatibleDonors(token, id)])
      .then(async ([requestData, donorData]) => {
        setRequest(requestData);
        setDonors(donorData);

        const isOwnerOrAdmin = isAdmin || requestData.createdBy?._id === userId;
        if (isOwnerOrAdmin) {
          const requestAppointments = await appointmentsApi.getRequestAppointments(token, id);
          setAppointments(requestAppointments);
        } else {
          // find out if the current donor already has an offer on this request
          const mine = await appointmentsApi.getMyAppointments(token);
          setMyOffer(mine.find((a) => a.request?._id === id) || null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(status) {
    setUpdating(true);
    try {
      const updated = await updateRequestStatus(token, id, status);
      setRequest(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleApply() {
    setApplying(true);
    setError("");
    try {
      const appointment = await appointmentsApi.createAppointment(token, id);
      setMyOffer(appointment);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  }

  async function handleInvite(donorId) {
    setInvitingDonorId(donorId);
    setError("");
    try {
      const appointment = await appointmentsApi.inviteDonor(token, id, donorId);
      setAppointments((current) => [...current, appointment]);
    } catch (err) {
      setError(err.message);
    } finally {
      setInvitingDonorId(null);
    }
  }

  async function handleConfirm({ appointmentDate, location }) {
    const updated = await appointmentsApi.confirmAppointment(token, actingAppointment._id, {
      appointmentDate,
      location,
    });
    setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    setActingAppointment(null);
  }

  async function handleReject(appointmentId) {
    try {
      const updated = await appointmentsApi.rejectAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleComplete(appointmentId) {
    setError("");
    try {
      const updated = await appointmentsApi.completeAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancelAppointment(appointmentId) {
    setError("");
    try {
      const updated = await appointmentsApi.cancelAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page-loading">Loading request...</div>;
  if (error && !request) return <p className="error-text">{error}</p>;
  if (!request) return null;

  const compatibleWithRequest = canDonateTo(user?.bloodType, request.bloodTypeNeeded);
  const donorIsEligible = computeEligibility(user?.lastDonationDate).eligible;

  // Appointments the OWNER needs to act on: donor-initiated offers, still pending
  const pendingOffers = appointments.filter((a) => a.initiatedBy === "DONOR" && a.status === "PENDING");
  // Invitations the owner already sent (awaiting the donor's answer)
  const sentInvites = appointments.filter(
    (a) => a.initiatedBy === "REQUESTER" && !["CONFIRMED", "COMPLETED"].includes(a.status)
  );
  const donationAppointments = appointments.filter((a) =>
    ["CONFIRMED", "COMPLETED"].includes(a.status)
  );

  function appointmentForDonor(donorId) {
    return appointments.find(
      (a) => a.donor?._id === donorId && ["PENDING", "CONFIRMED"].includes(a.status)
    );
  }

  return (
    <div>
      <button type="button" className="back-link" onClick={() => navigate("/urgent")}>
        <ArrowLeft size={15} />
        Back to requests
      </button>

      <div className="card detail-card">
        <div className="detail-top">
          <BloodTypeAvatar bloodType={request.bloodTypeNeeded} />
          <div>
            <RequestStatusBadge status={request.status} />
            <p className="detail-title">Blood needed</p>
            <p className="detail-meta">
              {request.hospital} · {request.city}
            </p>
          </div>
        </div>

        {request.reason && (
          <div className="detail-section">
            <h3>Reason</h3>
            <p>{request.reason}</p>
          </div>
        )}

        <div className="detail-section">
          <h3>Posted by</h3>
          <div className="detail-contact">
            <span>{request.createdBy?.name || "Unknown"}</span>
            {request.createdBy?.phone && <span>{request.createdBy.phone}</span>}
          </div>
          <p className="form-hint">Published on {formatDate(request.createdAt)}</p>
        </div>

        {/* Non-owner donor: offer to help */}
        {!canManage && request.status === "ACTIVE" && (
          <div className="detail-section">
            <h3>Want to help?</h3>
            {!compatibleWithRequest ? (
              <p className="form-hint">Your blood type is not compatible with this request.</p>
            ) : !donorIsEligible ? (
              <p className="form-hint">You are not eligible to donate yet.</p>
            ) : myOffer ? (
              <div className="appointment-row">
                <span>Your offer</span>
                <AppointmentStatusBadge status={myOffer.status} />
              </div>
            ) : (
              <button type="button" className="btn btn-primary" disabled={applying} onClick={handleApply}>
                {applying ? "Sending..." : "I can help"}
              </button>
            )}
          </div>
        )}

        {/* Owner: offers received from donors, needing a decision */}
        {canManage && (
          <div className="detail-section">
            <h3>Offers from donors</h3>
            {pendingOffers.length === 0 ? (
              <p className="form-hint">No pending offers yet.</p>
            ) : (
              <div className="appointment-list">
                {pendingOffers.map((appointment) => (
                  <div className="appointment-row" key={appointment._id}>
                    <div>
                      <p className="compatible-donor-name">{appointment.donor?.name}</p>
                      <p className="compatible-donor-meta">
                        {appointment.donor?.city} · {toShortBloodType(appointment.donor?.bloodType)}
                      </p>
                    </div>
                    <div className="appointment-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleReject(appointment._id)}
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setActingAppointment(appointment)}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="detail-section">
          <h3>Compatible donors nearby</h3>
          {donors.length === 0 ? (
            <p className="form-hint">No compatible donors found in this city yet.</p>
          ) : (
            <div className="compatible-donors-list">
              {donors.map((donor) => {
                const existing = canManage ? appointmentForDonor(donor._id) : null;
                return (
                  <div className="compatible-donor-row" key={donor._id}>
                    <div>
                      <p className="compatible-donor-name">{donor.name}</p>
                      <p className="compatible-donor-meta">{donor.city}</p>
                    </div>
                    <div className="appointment-actions">
                      <span className="badge badge-red">{toShortBloodType(donor.bloodType)}</span>
                      {canManage && request.status === "ACTIVE" && (
                        existing ? (
                          <AppointmentStatusBadge status={existing.status} />
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary donor-invite-btn"
                            disabled={invitingDonorId === donor._id}
                            onClick={() => handleInvite(donor._id)}
                          >
                            <Send size={14} />
                            {invitingDonorId === donor._id ? "Sending..." : "Invite"}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Owner: invitations already sent, awaiting donor's answer */}
        {canManage && sentInvites.length > 0 && (
          <div className="detail-section">
            <h3>Invitations sent</h3>
            <div className="appointment-list">
              {sentInvites.map((appointment) => (
                <div className="appointment-row" key={appointment._id}>
                  <div>
                    <p className="compatible-donor-name">{appointment.donor?.name}</p>
                    <p className="compatible-donor-meta">{appointment.donor?.city}</p>
                  </div>
                  <AppointmentStatusBadge status={appointment.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {canManage && donationAppointments.length > 0 && (
          <div className="detail-section">
            <h3>Scheduled donations</h3>
            <div className="appointment-list">
              {donationAppointments.map((appointment) => (
                <div className="appointment-row" key={appointment._id}>
                  <div>
                    <p className="compatible-donor-name">{appointment.donor?.name}</p>
                    <p className="compatible-donor-meta">
                      {formatDate(appointment.appointmentDate)}
                      {appointment.location ? ` · ${appointment.location}` : ""}
                    </p>
                  </div>
                  <div className="appointment-actions">
                    <AppointmentStatusBadge status={appointment.status} />
                    {appointment.status === "CONFIRMED" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleCancelAppointment(appointment._id)}
                        >
                          Cancel appointment
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleComplete(appointment._id)}
                        >
                          Mark donation completed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {canManage && request.status === "ACTIVE" && (
          <div className="detail-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={updating}
              onClick={() => handleStatusChange("CANCELLED")}
            >
              Cancel request
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={updating}
              onClick={() => handleStatusChange("FULFILLED")}
            >
              Mark as fulfilled
            </button>
          </div>
        )}
      </div>

      {actingAppointment && (
        <AppointmentConfirmModal
          title={`Confirm with ${actingAppointment.donor?.name}`}
          onClose={() => setActingAppointment(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

```

# frontend\src\pages\Urgent.css

```css
.urgent-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.urgent-filters {
  display: flex;
  gap: 0.8rem;
  margin: 1.4rem 0 1.6rem;
}

.urgent-filters select {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.9rem;
  background: var(--surface);
  color: var(--text);
}

.urgent-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.urgent-card {
  padding: 1.2rem 1.4rem;
  display: flex;
  align-items: flex-start;
  gap: 1.1rem;
}

.urgent-card-body {
  flex: 1;
}

.urgent-card-title {
  font-weight: 600;
  margin-top: 0.55rem;
}

.urgent-card-meta {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.urgent-card-reason {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.4rem;
}

.urgent-card-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.7rem;
  flex-shrink: 0;
}

.urgent-card-time {
  color: var(--text-muted);
  font-size: 0.78rem;
}

/* Back link used on detail and create pages */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-bottom: 1rem;
}

/* Create / edit request form */
.request-form-card {
  max-width: 560px;
  padding: 1.8rem 2rem;
  margin-top: 1.2rem;
}

.request-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 0.4rem;
}

.form-hint {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: -0.2rem;
  margin-bottom: 1rem;
}

/* Request detail page */
.detail-card {
  max-width: 640px;
  padding: 1.8rem 2rem;
  margin-top: 1.2rem;
}

.detail-top {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-title {
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.detail-meta {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.2rem;
}

.detail-section {
  margin-top: 1.4rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--border);
}

.detail-section h3 {
  font-size: 0.95rem;
  margin-bottom: 0.6rem;
}

.detail-contact {
  display: flex;
  gap: 1.6rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.detail-actions {
  display: flex;
  gap: 0.7rem;
  margin-top: 1.4rem;
}

.compatible-donors-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.compatible-donor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.compatible-donor-name {
  font-weight: 500;
}

.compatible-donor-meta {
  color: var(--text-muted);
  font-size: 0.82rem;
}

@media (max-width: 860px) {
  .urgent-header {
    flex-direction: column;
    gap: 0.8rem;
  }
  .urgent-card {
    flex-direction: column;
  }
  .urgent-card-side {
    align-items: flex-start;
    width: 100%;
  }
}

```

# frontend\src\pages\Urgent.jsx

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { listRequests } from "../api/requests";
import { RequestStatusBadge } from "../components/StatusBadge";
import BloodTypeAvatar from "../components/BloodTypeAvatar";
import { formatRelative } from "../utils/dates";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import { CITIES } from "../utils/cities";
import "./Urgent.css";

export default function Urgent() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState("");
  const [bloodType, setBloodType] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    listRequests(token, { city, bloodType })
      .then((data) => !ignore && setRequests(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token, city, bloodType]);

  return (
    <div>
      <div className="urgent-header">
        <div>
          <h1>Urgent Requests</h1>
          <p className="page-subtitle">Someone may need your help today.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
  <Link to="/urgent/mine" className="btn btn-secondary">
    My Requests
  </Link>
  <Link to="/urgent/new" className="btn btn-primary">
    <Plus size={16} />
    New Request
  </Link>
</div>
      </div>

      <div className="urgent-filters">
        <select value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={bloodType} onChange={(event) => setBloodType(event.target.value)}>
          <option value="">All blood types</option>
          {BLOOD_TYPES.map((type) => (
            <option key={type} value={type}>
              {toShortBloodType(type)}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="page-loading">Loading requests...</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <div className="card empty-state">No urgent requests right now. Check back soon.</div>
      )}

      <div className="urgent-list">
        {requests.map((request) => (
          <div className="card urgent-card" key={request._id}>
            <BloodTypeAvatar bloodType={request.bloodTypeNeeded} />
            <div className="urgent-card-body">
              <div className="urgent-card-top">
                <RequestStatusBadge status={request.status} />
              </div>
              <p className="urgent-card-title">Blood needed</p>
              <p className="urgent-card-meta">
                {request.hospital} · {request.city}
              </p>
              {request.reason && <p className="urgent-card-reason">{request.reason}</p>}
            </div>
            <div className="urgent-card-side">
              <span className="urgent-card-time">Posted: {formatRelative(request.createdAt)}</span>
              <Link className="btn btn-secondary" to={`/urgent/${request._id}`}>
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

```

# frontend\src\utils\bloodTypes.js

```js
// The backend stores blood types as e.g. "A_POSITIVE". We only ever show
// the short form ("A+") to users.
export const BLOOD_TYPES = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const COMPATIBILITY_MAP = {
  O_NEGATIVE: ["O_NEGATIVE"],
  O_POSITIVE: ["O_POSITIVE", "O_NEGATIVE"],
  A_NEGATIVE: ["A_NEGATIVE", "O_NEGATIVE"],
  A_POSITIVE: ["A_POSITIVE", "A_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
  B_NEGATIVE: ["B_NEGATIVE", "O_NEGATIVE"],
  B_POSITIVE: ["B_POSITIVE", "B_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
  AB_NEGATIVE: ["AB_NEGATIVE", "A_NEGATIVE", "B_NEGATIVE", "O_NEGATIVE"],
  AB_POSITIVE: BLOOD_TYPES,
};

export function canDonateTo(donorBloodType, bloodTypeNeeded) {
  return (COMPATIBILITY_MAP[bloodTypeNeeded] || []).includes(donorBloodType);
}

export function toShortBloodType(bloodType) {
  if (!bloodType) return "";
  const [letters, sign] = bloodType.split("_");
  return `${letters}${sign === "POSITIVE" ? "+" : "-"}`;
}

```

# frontend\src\utils\cities.js

```js
export const CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fes",
  "Tangier",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
  "Beni Mellal",
];

```

# frontend\src\utils\dates.js

```js
export const DONATION_INTERVAL_DAYS = 120;

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatRelative(value) {
  if (!value) return "";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

// Mirrors the backend rule used by GET /api/auth/eligibility so we can
// derive the same status anywhere we already have a lastDonationDate.
export function computeEligibility(lastDonationDate) {
  if (!lastDonationDate) {
    return { eligible: true, nextDonationDate: null, daysRemaining: 0 };
  }
  const last = new Date(lastDonationDate);
  const next = new Date(last);
  next.setDate(next.getDate() + DONATION_INTERVAL_DAYS);
  const daysRemaining = Math.max(
    0,
    Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  return { eligible: daysRemaining === 0, nextDonationDate: next, daysRemaining };
}

```

# frontend\vite.config.js

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

```

