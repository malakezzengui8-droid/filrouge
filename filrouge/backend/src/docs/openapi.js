const bloodTypes = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const requestStatuses = ["ACTIVE", "FULFILLED", "CANCELLED"];
const appointmentStatuses = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];

const userProperties = {
  _id: { type: "string", example: "665f1a2b3c4d5e6f78901234" },
  name: { type: "string", example: "Donor One" },
  email: { type: "string", format: "email", example: "donor@example.com" },
  CIN: { type: "string", example: "AB123456" },
  phone: { type: "string", nullable: true, example: "+212600000000" },
  city: { type: "string", nullable: true, example: "Casablanca" },
  bloodType: {
    type: "string",
    enum: bloodTypes,
    nullable: true,
    example: "O_NEGATIVE",
  },
  lastDonationDate: { type: "string", format: "date-time", nullable: true },
  role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const requestProperties = {
  _id: { type: "string", example: "665f1a2b3c4d5e6f78901234" },
  createdBy: {
    oneOf: [{ type: "string" }, { $ref: "#/components/schemas/UserSummary" }],
  },
  bloodTypeNeeded: { type: "string", enum: bloodTypes, example: "A_POSITIVE" },
  city: { type: "string", example: "Rabat" },
  hospital: { type: "string", example: "Hopital Ibn Sina" },
  reason: { type: "string", nullable: true, example: "Surgery" },
  status: { type: "string", enum: requestStatuses, example: "ACTIVE" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const appointmentProperties = {
  _id: { type: "string", example: "665f1a2b3c4d5e6f78901234" },
  request: {
    oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Request" }],
  },
  donor: {
    oneOf: [{ type: "string" }, { $ref: "#/components/schemas/UserSummary" }],
  },
  appointmentDate: { type: "string", format: "date-time", nullable: true },
  location: {
    type: "string",
    nullable: true,
    example: "CHU Ibn Rochd, blood bank",
  },
  status: { type: "string", enum: appointmentStatuses, example: "PENDING" },
  initiatedBy: {
    type: "string",
    enum: ["DONOR", "REQUESTER"],
    example: "DONOR",
  },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const idParameter = (name, description) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: {
    type: "string",
    pattern: "^[a-fA-F0-9]{24}$",
    example: "665f1a2b3c4d5e6f78901234",
  },
});

const authResponse = {
  type: "object",
  properties: {
    token: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    user: { $ref: "#/components/schemas/User" },
  },
};

const errorResponse = {
  description: "Error response",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
    },
  },
};

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Your Blood is Gold API",
    version: "1.0.0",
    description:
      "REST API for blood donation requests, donors, and appointments.",
  },
  servers: [{ url: "http://localhost:8000", description: "Local backend" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Donors" },
    { name: "Requests" },
    { name: "Appointments" },
    { name: "Admin" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Use the JWT returned by `/api/auth/login` or `/api/auth/register`.",
      },
    },
    parameters: {
      requestId: idParameter("id", "Blood request ID"),
      appointmentId: idParameter("id", "Appointment ID"),
      userId: idParameter("id", "User ID"),
    },
    schemas: {
      User: { type: "object", properties: userProperties },
      UserSummary: {
        type: "object",
        properties: {
          _id: userProperties._id,
          name: userProperties.name,
          city: userProperties.city,
          phone: userProperties.phone,
          bloodType: userProperties.bloodType,
        },
      },
      Request: { type: "object", properties: requestProperties },
      Appointment: { type: "object", properties: appointmentProperties },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password", "CIN"],
        properties: {
          name: { type: "string", example: "Donor One" },
          email: {
            type: "string",
            format: "email",
            example: "donor@example.com",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 6,
            example: "123456",
          },
          CIN: { type: "string", example: "AB123456" },
          phone: { type: "string", example: "+212600000000" },
          city: { type: "string", example: "Casablanca" },
          bloodType: {
            type: "string",
            enum: bloodTypes,
            example: "O_NEGATIVE",
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "donor@example.com",
          },
          password: { type: "string", format: "password", example: "123456" },
        },
      },
      ProfileUpdateInput: {
        type: "object",
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          city: { type: "string" },
          bloodType: { type: "string", enum: bloodTypes },
        },
      },
      RequestInput: {
        type: "object",
        required: ["bloodTypeNeeded", "city", "hospital"],
        properties: {
          bloodTypeNeeded: {
            type: "string",
            enum: bloodTypes,
            example: "AB_NEGATIVE",
          },
          city: { type: "string", example: "Rabat" },
          hospital: { type: "string", example: "Hopital Ibn Sina" },
          reason: { type: "string", example: "Surgery" },
        },
      },
      StatusInput: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: requestStatuses } },
      },
      InviteInput: {
        type: "object",
        required: ["donorId"],
        properties: {
          donorId: { type: "string", example: "665f1a2b3c4d5e6f78901234" },
        },
      },
      ConfirmAppointmentInput: {
        type: "object",
        required: ["appointmentDate"],
        properties: {
          appointmentDate: {
            type: "string",
            format: "date-time",
            example: "2026-10-01T10:00:00.000Z",
          },
          location: { type: "string", example: "CHU Ibn Rochd, blood bank" },
        },
      },
      Eligibility: {
        type: "object",
        properties: {
          lastDonationDate: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          nextDonationDate: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          daysRemaining: { type: "integer", example: 0 },
          eligible: { type: "boolean", example: true },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Resource not found" },
          errors: { type: "array", items: { type: "object" } },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        security: [],
        responses: {
          200: {
            description: "Server is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: { type: "string", example: "Server is running" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Registered successfully",
            content: { "application/json": { schema: authResponse } },
          },
          400: errorResponse,
          409: errorResponse,
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Logged in successfully",
            content: { "application/json": { schema: authResponse } },
          },
          400: errorResponse,
          401: errorResponse,
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: errorResponse,
        },
      },
      put: {
        tags: ["Auth"],
        summary: "Update current user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileUpdateInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "Delete current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Account deleted" },
          401: errorResponse,
        },
      },
    },
    "/api/auth/eligibility": {
      get: {
        tags: ["Auth"],
        summary: "Get current user donation eligibility",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Eligibility result",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Eligibility" },
              },
            },
          },
          401: errorResponse,
        },
      },
    },
    "/api/donors": {
      get: {
        tags: ["Donors"],
        summary: "Search eligible donors",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "city",
            in: "query",
            schema: { type: "string" },
            example: "Casablanca",
          },
          {
            name: "bloodType",
            in: "query",
            schema: { type: "string", enum: bloodTypes },
          },
        ],
        responses: {
          200: {
            description: "Matching donors",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/UserSummary" },
                },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
        },
      },
    },
    "/api/requests": {
      get: {
        tags: ["Requests"],
        summary: "List active blood requests",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "city", in: "query", schema: { type: "string" } },
          {
            name: "bloodType",
            in: "query",
            schema: { type: "string", enum: bloodTypes },
          },
        ],
        responses: {
          200: {
            description: "Active requests",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Request" },
                },
              },
            },
          },
          401: errorResponse,
        },
      },
      post: {
        tags: ["Requests"],
        summary: "Publish a blood request",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RequestInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Created request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Request" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
        },
      },
    },
    "/api/requests/me": {
      get: {
        tags: ["Requests"],
        summary: "List requests created by current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User requests",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Request" },
                },
              },
            },
          },
          401: errorResponse,
        },
      },
    },
    "/api/requests/{id}": {
      get: {
        tags: ["Requests"],
        summary: "Get one blood request",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/requestId" }],
        responses: {
          200: {
            description: "Blood request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Request" },
              },
            },
          },
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/requests/{id}/compatible-donors": {
      get: {
        tags: ["Requests"],
        summary: "Find compatible donors for a request",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/requestId" }],
        responses: {
          200: {
            description: "Compatible donors",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/UserSummary" },
                },
              },
            },
          },
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/requests/{id}/status": {
      put: {
        tags: ["Requests"],
        summary: "Update a request status",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/requestId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StatusInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Request" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/requests/{id}/appointments": {
      get: {
        tags: ["Appointments"],
        summary: "List appointments for a request",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/requestId" }],
        responses: {
          200: {
            description: "Request appointments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Appointment" },
                },
              },
            },
          },
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
      post: {
        tags: ["Appointments"],
        summary: "Offer to donate for a request",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/requestId" }],
        responses: {
          201: {
            description: "Created appointment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Appointment" },
              },
            },
          },
          401: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    "/api/requests/{id}/invite": {
      post: {
        tags: ["Appointments"],
        summary: "Invite a donor to a request",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/requestId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/InviteInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Created invitation",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Appointment" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    "/api/appointments/me": {
      get: {
        tags: ["Appointments"],
        summary: "List current user appointments",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Appointments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Appointment" },
                },
              },
            },
          },
          401: errorResponse,
        },
      },
    },
    "/api/appointments/{id}/confirm": {
      put: {
        tags: ["Appointments"],
        summary: "Confirm an appointment",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/appointmentId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConfirmAppointmentInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Confirmed appointment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Appointment" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
        },
      },
    },
    "/api/appointments/{id}/reject": {
      put: {
        tags: ["Appointments"],
        summary: "Reject a pending appointment",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/appointmentId" }],
        responses: {
          200: {
            description: "Rejected appointment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Appointment" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/appointments/{id}/cancel": {
      put: {
        tags: ["Appointments"],
        summary: "Cancel an appointment",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/appointmentId" }],
        responses: {
          200: {
            description: "Cancelled appointment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Appointment" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/appointments/{id}/complete": {
      put: {
        tags: ["Appointments"],
        summary: "Mark a completed donation",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/appointmentId" }],
        responses: {
          200: {
            description: "Completed appointment",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Appointment" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    "/api/admin/users/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get a user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/userId" }],
        responses: {
          200: {
            description: "User",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
      put: {
        tags: ["Admin"],
        summary: "Update a user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/userId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileUpdateInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete a user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/userId" }],
        responses: {
          200: { description: "Deleted user" },
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/admin/requests": {
      get: {
        tags: ["Admin"],
        summary: "List all blood requests",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "All requests",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Request" },
                },
              },
            },
          },
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    "/api/admin/requests/{id}/status": {
      put: {
        tags: ["Admin"],
        summary: "Update any request status",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/requestId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StatusInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Request" },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
          404: errorResponse,
        },
      },
    },
    "/api/admin/statistics": {
      get: {
        tags: ["Admin"],
        summary: "Get platform statistics",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalUsers: { type: "integer" },
                    totalAdmins: { type: "integer" },
                    totalRequests: { type: "integer" },
                    activeRequests: { type: "integer" },
                    fulfilledRequests: { type: "integer" },
                    cancelledRequests: { type: "integer" },
                  },
                },
              },
            },
          },
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
  },
};

export default openapi;
