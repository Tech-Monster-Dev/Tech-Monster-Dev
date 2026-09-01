import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import publicRoutes from "./modules/public/public.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import certificateRoutes from "./modules/certificates/certificate.routes.js";
import certificatePaymentRoutes from "./modules/certificatePayments/certificatePayment.routes.js";
import adminCertificatePaymentRoutes from "./modules/certificatePayments/adminCertificatePayment.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import followRoutes from "./modules/follow/follow.routes.js";
import adminTaskRoutes from "./modules/tasks/admin/adminTask.routes.js";
import internshipRoutes from "./modules/internships/internship.routes.js";
import courseRoutes from "./modules/courses/course.routes.js";
import learningRoutes from "./modules/learning/learning.routes.js";
import submissionRoutes from "./modules/submissions/submission.routes.js";
import adminSubmissionRoutes from "./modules/submissions/adminSubmission.routes.js";
import supportRoutes from "./modules/support/support.routes.js";
import codeExecutionRoutes from "./modules/codeExecution/codeExecution.routes.js";

import serverRoutes from "./infrastructure/server/server.routes.js";

import morganMiddleware from "./infrastructure/logging/logger.middleware.js";
import errorHandler from "./core/errors/errorHandler.js";


import { swaggerUi, swaggerSpec } from "./infrastructure/docs/swagger.js";

const app = express();

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  "http://localhost:5199",
  "http://localhost:5173",
  "http://localhost:3000",

  // Production
  "https://tech-monster-dev-lac.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);

      return callback(new Error(`CORS blocked: ${origin}`));
    },

    credentials: true
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

// ==========================================
// Logger Middleware
// FIRST
// ==========================================

app.use(morganMiddleware);

// ==========================================
// Health Check
// ==========================================
app.get("/api/health", (req, res) => {

  if (process.env.MAINTENANCE_MODE === "true") {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message: "Website is under maintenance."
    });
  }

  res.status(200).json({
    success: true
  });

});

app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === "true") {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message: "Website is under maintenance."
    });
  }
  next();

});


// ==========================================
// API Routes
// ==========================================
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/certificate-payments", certificatePaymentRoutes);
app.use("/api/certificate-payments/admin", adminCertificatePaymentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/tasks", adminTaskRoutes);
app.use("/api/admin/submissions", adminSubmissionRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/code-execution", codeExecutionRoutes);
app.use("/api/server", serverRoutes);


// ==========================================
// Swagger Documentation
// ==========================================
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerSpec,
    {
      explorer: true
    }
  )
);

// ==========================================
// Health Check
// MUST BE BEFORE 404
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tech Monster Backend Running 🚀"
  });
});


// ==========================================
// 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found"
  });
});

// ==========================================
// Error Middleware
// ALWAYS LAST
// ==========================================
app.use(errorHandler);

export default app;