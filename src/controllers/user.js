import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import path from "node:path";
import { PORT } from "../utils/variable.js";
import { extValidation } from "../validations/extValidation.js";
import { sizeValidation } from "../validations/sizeValidation.js";
import { genFullNameImage } from "../utils/genFullNameImage.js";
import { jwtDecode } from "jwt-decode";
import { clearSpace } from "../utils/replaceWhiteSpace.js";

// handle get users
export const getUsers = async (req, res) => {
  // get users from database and filter field
  try {
    const { refreshToken } = req.cookies;
    const { data } = jwtDecode(refreshToken);
    const users = await prisma.users.findFirst({
      where: {
        username: data.username,
      },
      select: {
        username: true,
        image_url: true,
        point: true,
        banned: true,
      },
    });
    // send response to response body
    return res.json({
      message: "Get user successfuly",
      data: users,
    });
  } catch (error) {
    console.log(error);
  }
};

// handle create user / signup / register
export const createUser = (req, res) => {
  // get data form request body
  const { username, password, confirmPassword } = req.body;
  let cleanedString = clearSpace(username);

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
            username: cleanedString,
            password: hash,
            point: 0,
          },
        });
        // send message to response body
        res.status(200).json({
          message: "Create user successfuly",
        });
      } catch (err) {
        const target = err.meta.target[0];
        if (err.code === "P2002") {
          res.status(400).json({
            message: `${target} is unique`,
          });
        }
      }
    });
  });
};

// handle update user
export const updateUser = async (req, res) => {
  // get url from path
  const { protocol, hostname } = req;

  // get field from body and file request
  const { username } = req.body;
  const { name, md5, size, mv } = req.files.file;

  // create fullname image, ext, url image and path to move image
  const fullName = genFullNameImage(md5, name);
  const ext = path.extname(name);
  const imageUrl = genUrlImage(protocol, hostname, PORT, "images", md5, name);
  const uploadPath = path.resolve("./public/images/", fullName);

  // validate image, when extension is matched
  if (extValidation(ext)) {
    return res
      .status(400)
      .json({ message: "Accepted file is jpg, jpeg or png" });
  }

  // validate size image must be less 5MB
  if (sizeValidation(size)) {
    return res.status(400).json({ message: "File more than 5MB" });
  }

  // validate blank character or white space
  if (blankChar(username)) {
    return res.status(400).json({ message: "bad request" });
  }

  // move images file
  mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // handle update user for imageUrl and imageUser column
  try {
    await prisma.users.update({
      where: {
        username,
      },
      data: {
        image_url: imageUrl,
        user_image: fullName,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json({ message: "User updated" });
};

export const getUserProggress = async (req, res) => {
  const { username, categorie, level } = req.query;
  try {
    const getUser = await prisma.users.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    const getCategorie = await prisma.category.findUnique({
      where: {
        category_name: categorie,
      },
      select: {
        id: true,
      },
    });

    const progres = await prisma.userProggress.findFirst({
      where: {
        category_id: parseInt(getCategorie.id),
        user_id: parseInt(getUser.id),
      },
      select: {
        current_level: true,
      },
    });
    return res.json({ valid_level: level <= progres.current_level });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
