// Testing Phase Completed
import { eq } from "drizzle-orm";
import { Request, Response } from "express";

import { SCHOOL_DOMAIN } from "../constants";
import { db } from "../db";
import { school, schoolDomain } from "../db/schema";
import { ApiError, ApiSuccess } from "../utils/apiResponse.utils";

export const verifyDomain = async (req: Request, res: Response) => {
  try {
    const domainExists = await db.select().from(schoolDomain).where(eq(schoolDomain.domain, SCHOOL_DOMAIN)).limit(1);

    if (domainExists.length === 0) {
      return ApiSuccess(res, "Domain does not exist in database", 200, {
        exists: false,
        domain: SCHOOL_DOMAIN,
      });
    }

    const schoolRecord = await db.select().from(school).where(eq(school.domain, SCHOOL_DOMAIN)).limit(1);

    return ApiSuccess(res, "Domain exists in database", 200, {
      domain: SCHOOL_DOMAIN,
      exists: true,
      domainId: domainExists[0].id,
      schoolId: schoolRecord.length > 0 ? schoolRecord[0].id : domainExists[0].schoolId,
    });
  } catch {
    return ApiError(res, "Internal Server Error", 500);
  }
};
