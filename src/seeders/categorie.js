import { prisma } from "../config/db.js";

export async function categorieSeeder() {
  await prisma.category.createMany({
    data: [
      {
        image: "categorie_fruit.png",
        url_image: "http://localhost:2000/categories/categorie_fruit.png",
        category_name: "fruit",
      },
      {
        image: "categorie_animal.png",
        url_image: "http://localhost:2000/categories/categorie_animal.png",
        category_name: "animal",
      },
      {
        image: "categorie_globe.png",
        url_image: "http://localhost:2000/categories/categorie_globe.png",
        category_name: "geography",
      },
      {
        image: "categorie_book.png",
        url_image: "http://localhost:2000/categories/categorie_book.png",
        category_name: "history",
      },
      {
        image: "categorie_science.png",
        url_image: "http://localhost:2000/categories/categorie_science.png",
        category_name: "science",
      },
      {
        image: "categorie_song.png",
        url_image: "http://localhost:2000/categories/categorie_song.png",
        category_name: "song",
      },
      {
        image: "categorie_film.png",
        url_image: "http://localhost:2000/categories/categorie_film.png",
        category_name: "film",
      },
      {
        image: "categorie_food.png",
        url_image: "http://localhost:2000/categories/categorie_food.png",
        category_name: "food",
      },
    ],
  });
}
