import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";

// handle get users
export const getUsers = async (req, res) => {
  // get users from database and filter field
  try {
    const users = await prisma.users.findMany({
      select: {
        username: true,
        email: true,
        user_image: true,
        point: true,
        banned: true,
      },
    });
  } catch (error) {
    console.log(error);
  }

  // send response to response body
  res.send({
    message: "Get user successfully",
    data: users,
  });
};

// handle create user / signup / register
export const createUser = (req, res) => {
  // get data form request body
  const { username, email, password, confirmPassword } = req.body;

  // check password and confirm password should be match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Password doesn't match" });
  }

  // create hash
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      // create new user
      try {
        await prisma.users.create({
          data: {
            username,
            email,
            password: hash,
            point: 0,
          },
        });
        // send message to response body
        res.status(200).send({
          message: "Create user successfully",
          data: {
            email,
            username,
          },
        });
      } catch (err) {
        const target = err.meta.target[0];
        if (err.code === "P2002") {
          res.status(400).send({
            message: `${target} is unique`,
          });
        }
      }
    });
  });
};
