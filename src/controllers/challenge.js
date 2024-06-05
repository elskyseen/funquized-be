import { jwtDecode } from "jwt-decode";
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

export const postChallenge = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const decode = jwtDecode(refreshToken);
    const { level, categorie, answer } = req.body;
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
        answer: true,
        point: true,
      },
    });

    if (answer === challenge.answer) {
      const { username } = decode.data;
      const user = await prisma.users.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
          point: true,
        },
      });

      await prisma.users.update({
        where: {
          username,
        },
        data: {
          point: user.point + challenge.point,
        },
      });

      await prisma.user_proggress.updateMany({
        where: {
          categorie_id: id,
          user_id: user.id,
        },
        data: {
          current_level: level != "20" ? parseInt(level) + 1 : 20,
        },
      });
    }

    const data = {
      current_level: `level ${level}`,
      answer_user: answer,
      answer: answer === challenge.answer ? answer : "-----",
      is_correct: answer === challenge.answer,
      earn_point: answer === challenge.answer ? challenge.point : 0,
    };

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
