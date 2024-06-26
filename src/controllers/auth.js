import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { clearSpace } from "../utils/replaceWhiteSpace.js";
import cookie from "cookie";

// get secret and refresh key from env
const secretKey = process.env.SECRET_KEY;
const refreshKey = process.env.REFRESH_KEY;

// function for generate token using jwt
const generateToken = (data, secretKey, time) => {
  const token = jwt.sign({ data }, secretKey, { expiresIn: time });
  return token;
};

// handler login from router
export const login = async (req, res) => {
  // get username and password form body request
  const { username, password } = req.body;
  let cleanedString = clearSpace(username);

  // find user with username
  const user = await prisma.users.findUnique({
    where: {
      username: cleanedString,
    },
  });

  // compare password from database with request from user
  bcrypt.compare(password, user.password).then(async function (result) {
    // check when user exist
    if (result) {
      const data = {
        username: user.username,
        point: user.point,
        image: user.image_url,
      };
      // generate jwt token using function declare
      const accessToken = generateToken(data, secretKey, "1d");
      const refreshToken = generateToken(data, refreshKey, "1d");

      // update column refresh_token on database
      await prisma.users.update({
        where: {
          username: data.username,
        },
        data: {
          refresh_token: refreshToken,
        },
      });

      // set cookie with name "refreshToken"
      if (data && data.username) {
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("refreshToken", refreshToken, {
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "None",
            partitioned: true,
          })
        );
      }
      // send access token to response body
      return res.json({ accessToken });
    } else {
      // when user doesn't exist, send failed message
      return res.status(400).json({ message: "Failed to login" });
    }
  });
};

// handler new token
export const refreshToken = async (req, res) => {
  // get refresh token from cookie
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "User Unauthorize" });
  }
  try {
    const checkTokenValid = await prisma.users.findMany({
      where: {
        refresh_token: refreshToken,
      },
      select: {
        refresh_token: true,
      },
    });

    if (checkTokenValid === null) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // verify token with refresh key from env
    const jwtDecoded = jwt.verify(refreshToken, refreshKey);

    const accessToken = generateToken(jwtDecoded.data, secretKey, "1d");

    // send response to response body
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(400).json(error);
  }
};

// handler logout user
export const logout = async (req, res) => {
  // get username from request body
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is needed!" });
  }

  // update refresh token to null
  await prisma.users.update({
    where: {
      username,
    },
    data: {
      refresh_token: null,
    },
  });

  // clear cookie from user
  res.clearCookie("isLogin");
  // send message
  return res.status(200).json({ message: "Logout successfuly" });
};
