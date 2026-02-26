import "@dotenvx/dotenvx/config";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";

import { pool } from "./db";
import adminRouter from "./routes/admin.route";
import analyticsRouter from "./routes/analytics.route";
import assignmentRouter from "./routes/assignment.route";
import assignmentCompletedRouter from "./routes/assignmentCompleted.route";
import authRouter from "./routes/auth.route";
import commentRouter from "./routes/comment.route";
import courseRouter from "./routes/course.route";
import courseInstructorRouter from "./routes/courseInstructor.route";
import courseLectureRouter from "./routes/courseLecture.route";
import domainRouter from "./routes/domain.route";
import instructorRouter from "./routes/instructor.route";
import lectureRouter from "./routes/lecture.route";
import lectureWatchedRouter from "./routes/lectureWatched.route";
import packagesRouter from "./routes/packages.route";
import qnaCompletedRouter from "./routes/qnaCompleted.route";
import questionRouter from "./routes/question.route";
import schoolRouter from "./routes/school.route";
import studentRouter from "./routes/student.route";
import superAdminRouter from "./routes/superAdmin.route";
import { ApiError, ApiSuccess } from "./utils/apiResponse.utils";
import auth from "./utils/auth.util";

const app = express();
const PORT = process.env.PORT || 5000;

// Development Logging
app.use(morgan("dev"));

// CORS - accept any origin for demo
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200,
  }),
);

// Body parsers MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------------- //
// Routes Go Here

// Better-auth router
app.use("/api/auth", toNodeHandler(auth));
// Add /api/me as an alias for session endpoint (for server-side auth checks)
app.get("/api/me", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      headers: req.headers as any,
    });

    if (!session) {
      return ApiError(res, "Not authenticated", 401);
    }

    return ApiSuccess(res, "Session retrieved", 200, session);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return ApiError(res, "Error retrieving session", 401);
  }
});

app.use("/api/superAdmin", superAdminRouter);
app.use("/api/admin", adminRouter);
app.use("/api/password", authRouter);
app.use("/api/student", studentRouter);
app.use("/api/school", schoolRouter);
app.use("/api/question", questionRouter);
app.use("/api/instructor", instructorRouter);
app.use("/api/lecture", lectureRouter);
app.use("/api/lecture-watched", lectureWatchedRouter);
app.use("/api/course", courseRouter);
app.use("/api/course-instructor", courseInstructorRouter);
app.use("/api/course-lecture", courseLectureRouter);
app.use("/api/packages", packagesRouter);

app.use("/api/assignment", assignmentRouter);
app.use("/api/qna-completed", qnaCompletedRouter);
app.use("/api/assignment-completed", assignmentCompletedRouter);
app.use("/api/comment", commentRouter);

app.use("/api/analytics", analyticsRouter);
app.use("/api/domain", domainRouter);

// ----------------------------------------------------------- //
app.get("/", (req: Request, res: Response) => {
  return ApiSuccess(res, "Welcome to the API", 200, { version: "1.0.0" });
});

app.get("/test", (req: Request, res: Response) => {
  return ApiSuccess(res, "API is working fine", 200, { time: new Date().toISOString() });
});

// 404 Handler - Route not found
app.use((req: Request, res: Response) => {
  ApiError(res, "Route not found", 404, { path: req.originalUrl });
});

const server = app
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port https://localhost:${PORT}`);
  })
  .on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("Server failed to start:", err);
  });

// Graceful shutdown - close pool connections
process.on("SIGTERM", async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

export default app;
