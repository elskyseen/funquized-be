import { prisma } from "../config/db.js";
import { categories, challenges } from "../utils/propertie.js";

export async function challengeSeeder() {
  categories.map((categorie) => {
    challenges[categorie.category_name].map(async (challenge) => {
      const { categorie_id, question, choices, answer, level, point } =
        challenge;
      await prisma.challenges.create({
        data: {
          categorie_id,
          question,
          choices,
          answer,
          level,
          point,
        },
      });
    });
  });
}
