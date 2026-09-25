import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import openapi from "./docs/openapi.js";

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// API documentation
app.get("/api-docs.json", (req, res) => {
  res.status(200).json(openapi);
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    explorer: true,
    customSiteTitle: "Your Blood is Gold API Docs",
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler (must be LAST)
app.use(errorHandler);

export default app;
