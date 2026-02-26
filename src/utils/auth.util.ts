import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI } from "better-auth/plugins";

import { db } from "../db";
import { ac, schoolAdmin, student, superAdmin } from "./permissions.util";

const auth = betterAuth({
  baseURL: process.env.BACKEND_URL || "http://localhost:5000",

  database: drizzleAdapter(db, {
    provider: "pg",
    debugLogs: true,
    camelCase: true,
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  advanced: {
    cookiePrefix: "curiotech",
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  user: {
    additionalFields: {
      schoolId: {
        type: "string",
        required: false,
      },
      studentId: {
        type: "string",
        required: false,
      },
      controllerId: {
        type: "string",
        required: false,
      },
      isActive: { type: "boolean" },
      disabledAt: { type: "date" },
    },
  },

  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],

  plugins: [
    openAPI(),
    admin({
      ac,
      defaultRole: "student",
      adminRoles: ["superAdmin"],
      roles: {
        student,
        schoolAdmin,
        superAdmin,
      },
    }),
  ],
});

export default auth;
