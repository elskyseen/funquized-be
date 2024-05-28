import { prisma } from "../config/db.js";

export const getChallenge = async (req, res) => {
  try {
    const { level, categorie } = req.query;
    const { id } = await prisma.categories.findFirst({
      where: {
        category_name: categorie,
      },
      select: {
        id: true,
      },
    });
    const challenge = await prisma.challenges.findFirst({
      where: {
        categorie_id: id,
        level: parseInt(level),
      },
      select: {
        challenge_image: true,
        question: true,
        choices: true,
      },
    });
    return res.json({ data: challenge });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
