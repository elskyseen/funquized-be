import { prisma } from "../config/db.js";
import { categorieSeeder } from "./categorie.js";
import { challengeSeeder } from "./challenges.js";

async function seeder() {
  categorieSeeder();
  challengeSeeder();
}

seeder()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
