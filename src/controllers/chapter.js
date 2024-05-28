import { jwtDecode } from "jwt-decode";
import { prisma } from "../config/db.js";

export const getChapters = async (req, res) => {
  const { categorie } = req.query;
  const { refreshToken } = req.cookies;
  const { data } = jwtDecode(refreshToken);
  try {
    const getUser = await prisma.users.findFirst({
      where: {
        email: data.email,
      },
      select: {
        id: true,
      },
    });

    const getCategorie = await prisma.categories.findFirst({
      where: {
        category_name: categorie,
      },
      select: {
        id: true,
      },
    });

    const challenges = await prisma.challenges.findMany({
      where: {
        categorie_id: getCategorie.id,
      },
      select: {
        level: true,
        point: true,
      },
    });

    let progres = await prisma.user_proggress.findFirst({
      where: {
        categorie_id: getCategorie.id,
        user_id: getUser.id,
      },
      select: {
        current_level: true,
      },
    });

    if (!progres) {
      progres = { current_level: 1 };
      await prisma.user_proggress.create({
        data: {
          categorie_id: getCategorie.id,
          user_id: getUser.id,
          current_level: 1,
        },
      });
    }

    return res.json({ data: challenges, progres });
  } catch (error) {
    return res.json({ message: error.message });
  }
};
