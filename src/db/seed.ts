import "dotenv/config";
import { db, client } from "./index";
import { users } from "./schema";
import { MODELS, PROVIDERS } from "../platform/lib/constants";
import { UserDBInsert } from "../lib/types";

async function seed() {
  // This will run the seed file
  console.log("Seeding database...");
  const existingUsers = await db.select().from(users);
  const userInserts = [];

  for (const provider of PROVIDERS) {
    for (const model of MODELS[provider.id]) {
      if (existingUsers.find((u) => u.id === model.id)) {
        console.log(`User ${model.id} already exists - skipping`);

        continue;
      }

      const user: UserDBInsert = {
        id: model.id,
        fullName: model.fullName,
        imgURL: model.imgURL,
        providerID: provider.id,
        isSelf: false,
      };
      userInserts.push(db.insert(users).values(user));
    }
  }

  await Promise.all(userInserts);

  await client.end();
}

seed();
