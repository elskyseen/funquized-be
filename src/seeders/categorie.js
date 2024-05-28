import { prisma } from "../config/db.js";
import { categories } from "../utils/propertie.js";

export async function categorieSeeder() {
  for (let i = 0; i < categories.length; i++) {
    await prisma.categories.create({
      data: {
        image: categories[i].image,
        url_image: categories[i].url_image,
        category_name: categories[i].category_name,
      },
    });
  }
}
