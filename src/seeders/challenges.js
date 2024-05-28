import { prisma } from "../config/db.js";
import { categories, challenges } from "../utils/propertie.js";

export async function challengeSeeder() {
  for (let i = 0; i < categories.length; i++) {
    for (let j = 0; j < challenges[categories[i].category_name].length; j++) {
      const spesifyCategorie = challenges[categories[i].category_name][j];
      await prisma.challenges.create({
        data: {
          categorie_id: spesifyCategorie.categorie_id,
          question: spesifyCategorie.question,
          choices: spesifyCategorie.choices,
          answer: spesifyCategorie.answer,
          level: spesifyCategorie.level,
          point: spesifyCategorie.point,
        },
      });
    }
  }
}
