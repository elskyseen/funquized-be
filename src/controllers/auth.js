import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// get secret and refresh key from env
const secretKey = process.env.SECRET_KEY;
const refreshKey = process.env.REFRESH_KEY;

// function for generate token using jwt
const generateToken = (data, secretKey, time) => {
  const token = jwt.sign({ data }, secretKey, { expiresIn: time });
  return token;
};

// function to check refresh token is valid or no
const checkToken = async (refreshToken, res) => {
  if (!refreshToken) {
    return res.status(401);
  }
  const checkTokenValid = await prisma.users.findFirst({
    where: {
      refresh_token: "dsadada",
    },
  });
  if (checkTokenValid === null) {
    return res.status(403);
  }
};

// function for check error for handle jwt
const checkErrJWT = (err) => {
  if (err) {
    return res.status(204);
  }
};

// handler login from router
export const login = async (req, res) => {
  // get username and password form body request
  const { username, password } = req.body;

  // find user with username
  const user = await prisma.users.findFirst({
    where: username,
  });

  // compare password from database with request from user
  bcrypt.compare(password, user.password).then(async function (result) {
    // check when user exist 
    if (result) {
      const data = {
        username: user.username,
        email: user.email,
        point: user.point,
        image: user.user_image,
      };
      // generate jwt token using function declare
      const accessToken = generateToken(data, secretKey, "20s");
      const refreshToken = generateToken(data, refreshKey, "1d");

      // set cookie with name "refreshToken"
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      // update column refresh_token on database
      await prisma.users.update({
        where: {
          email: data.email,
        },
        data: {
          refresh_token: refreshToken,
        },
      });
      // send access token to response body
      res.send({ accessToken });
    } else {
      // when user doesn't exist, send failed message
      res.status(400).send({ message: "Failed to login" });
    }
  });
};

// handler new token
export const refreshToken = async (req, res) => {
  // get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;

  // check token using function declare
  checkToken(refreshToken, res);

  // verify token with refresh key from env
  jwt.verify(refreshToken, refreshKey, function (err, decoded) {
    checkErrJWT(err);

    // generate new access token
    const accessToken = generateToken(decoded.data, secretKey, "20s");

    // send response to response body
    return res.status(200).send({ accessToken });
  });
};

// handler logout user
export const logout = async (req, res) => {
  // get email from request body
  const { email } = req.body;

  // update refresh token to null
  await prisma.users.update({
    where: {
      email: email,
    },
    data: {
      refresh_token: null,
    },
  });

  // clear cookie from user
  res.clearCookie("refreshToken");

  // send message
  return res.status(200).send({ message: "Logout successfully" });
};
