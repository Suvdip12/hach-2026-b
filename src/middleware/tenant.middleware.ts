import { eq, type InferSelectModel } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";

import { SCHOOL_DOMAIN } from "../constants";
import { db } from "../db";
import { school } from "../db/schema";

type SchoolRow = InferSelectModel<typeof school>;

export async function tenantResolver(req: Request & { school?: SchoolRow }, res: Response, next: NextFunction) {
  try {
    const schoolRows = await db.select().from(school).where(eq(school.domain, SCHOOL_DOMAIN)).execute();

    if (!schoolRows || schoolRows.length === 0) {
      req.school = undefined;
      return next();
    }

    req.school = schoolRows[0];

    next();
  } catch (err) {
    next(err);
  }
}
