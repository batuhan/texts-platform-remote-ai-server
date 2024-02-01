import { Request, Response } from "express";
import { users } from "../db/schema";
import { db } from "../db";
import { dbUserToTextsUser } from "../lib/helpers";

export const searchUsers = async (req: Request, res: Response) => {
  const allUsers = await db.select().from(users);

  if (!allUsers) {
    res.send({ data: [] });
    return;
  }

  const textsUsers = allUsers.map((user) => {
    const textsData = dbUserToTextsUser(user);
    return textsData;
  });

  res.send({ data: textsUsers });
};
