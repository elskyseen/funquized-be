import { prisma } from "../config/db.js";

export const getChallenge = async (req, res) => {
  try {
    const { level, categorie } = req.query;
    const { id } = await prisma.category.findFirst({
      where: {
        category_name: categorie,
      },
      select: {
        id: true,
      },
    });
    const challenge = await prisma.challenges.findFirst({
      where: {
        category_id: id,
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
    const { level, categorie, answer, username } = req.body;
    const { id } = await prisma.category.findFirst({
      where: {
        category_name: categorie,
      },
      select: {
        id: true,
      },
    });
    const challenge = await prisma.challenges.findFirst({
      where: {
        category_id: id,
        level: parseInt(level),
      },
      select: {
        answer: true,
        point: true,
      },
    });
    const user = await prisma.users.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        point: true,
      },
    });

    const progresUser = await prisma.userProggress.findFirst({
      where: {
        category_id: id,
        user_id: user.id,
      },
      select: {
        current_level: true,
      },
    });

    if (level == progresUser.current_level && answer === challenge.answer) {
      await prisma.users.update({
        where: {
          username,
        },
        data: {
          point: user.point + challenge.point,
        },
      });
      await prisma.userProggress.updateMany({
        where: {
          category_id: id,
          user_id: user.id,
        },
        data: {
          current_level: parseInt(level) + 1,
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
