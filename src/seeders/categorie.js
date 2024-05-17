import { prisma } from "../config/db.js";
import { categories } from "../utils/propertie.js";

export async function categorieSeeder() {
  categories.map(async (categorie) => {
    const { image, url_image, category_name } = categorie;
    return await prisma.categories.create({
      data: {
        image,
        url_image,
        category_name,
      },
    });
  });
}
