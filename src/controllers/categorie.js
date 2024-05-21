import { prisma } from "../config/db.js";
import path from "node:path";
import { extValidation } from "../validations/extValidation.js";
import { sizeValidation } from "../validations/sizeValidation.js";
import { genUrlImage } from "../utils/genUrlImage.js";
import { PORT } from "../utils/variable.js";
import { genFullNameImage } from "../utils/genFullNameImage.js";
import { blankChar } from "../validations/blankCharValidation.js";

export const getCategorie = async (req, res) => {
  try {
    const categorie = await prisma.categories.findMany();
    return res.json({ message: "Get caregorie successfuly", data: categorie });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCategorie = async (req, res) => {
  // handle required file
  if (!req.files) {
    return res.status(400).json({ message: "Oops! file is required" });
  }

  const { protocol, hostname } = req;
  const { categorie } = req.body;
  const { name, size, md5, mv } = req.files.file;

  const fullName = genFullNameImage(md5, name);
  const imageUrl = genUrlImage(
    protocol,
    hostname,
    PORT,
    "categories",
    md5,
    name
  );
  const uploadPath = path.resolve("./public/categories/", fullName);
  const ext = path.extname(name);

  try {
    const findCategorie = await prisma.categories.findFirst({
      where: {
        image: fullName,
      },
    });
    if (findCategorie?.image === fullName) {
      return res
        .status(400)
        .json({ message: "Image already use, please choose other image" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  if (extValidation(ext)) {
    return res
      .status(400)
      .json({ message: "Accepted file is jpg, jpeg or png" });
  }

  if (sizeValidation(size)) {
    return res.status(400).json({ message: "File more than 5MB" });
  }

  if (blankChar(categorie)) {
    return res.status(400).json({ message: "bad request" });
  }

  // move images file
  mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  try {
    await prisma.categories.create({
      data: {
        image: fullName,
        category_name: categorie,
        url_image: imageUrl,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: `${categorie} already exist` });
  }

  res.status(201).json({ message: "Create categorie successfuly" });
};
