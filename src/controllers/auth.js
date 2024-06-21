import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  CLIENT_URL,
  URL_CALLBACK,
} from "../utils/variable.js";

// get secret and refresh key from env
const secretKey = process.env.SECRET_KEY;
const refreshKey = process.env.REFRESH_KEY;

const oauth2client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  URL_CALLBACK
);

// function for generate token using jwt
const generateToken = (data, secretKey, time) => {
  const token = jwt.sign({ data }, secretKey, { expiresIn: time });
  return token;
};

// handler login from router
export const login = async (req, res) => {
  // get username and password form body request
  const { email, password } = req.body;

  // find user with username
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  // compare password from database with request from user
  bcrypt.compare(password, user.password).then(async function (result) {
    // check when user exist
    if (result) {
      const data = {
        username: user.username,
        email: user.email,
        point: user.point,
        image: user.image_url,
      };
      // generate jwt token using function declare
      const accessToken = generateToken(data, secretKey, "1d");
      const refreshToken = generateToken(data, refreshKey, "1d");

      // set cookie with name "refreshToken"
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("isLogin", true, {
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
      res.json({ data, accessToken });
    } else {
      // when user doesn't exist, send failed message
      res.status(400).json({ message: "Failed to login" });
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
    jwt.verify(refreshToken, refreshKey, function (err, decoded) {
      // check error for handle jwt
      if (err) return res.status(204).json({ err });

      // generate new access token
      const accessToken = generateToken(decoded.data, secretKey, "1d");

      // send response to response body
      return res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// handler logout user
export const logout = async (req, res) => {
  // get email from request body
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
  res.clearCookie("refreshToken");
  res.clearCookie("isLogin");
  // send message
  return res.status(200).json({ message: "Logout successfuly" });
};

export const googleLogin = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const authorizeUrl = oauth2client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
  });

  return res.redirect(authorizeUrl);
};

export const googleCallback = async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2client.getToken(code);

  oauth2client.setCredentials(tokens);

  const { people } = google.people({ version: "v1", auth: oauth2client });
  people.get(
    {
      resourceName: "people/me",
      personFields: "names,emailAddresses,photos",
    },
    async (err, result) => {
      if (err) return console.error("The API returned an error: " + err);
      const { names, emailAddresses, photos } = result.data;

      const { displayName } = names[0];
      const { url } = photos[0];
      const { value } = emailAddresses[0];

      let data;

      const user = await prisma.users.findUnique({
        where: {
          username: displayName,
        },
        select: {
          user_image: true,
          email: true,
          point: true,
          username: true,
        },
      });

      if (user) {
        data = {
          username: user.username,
          email: user.email,
          point: user.point,
          image: user.user_image,
        };
      } else {
        data = {
          username: displayName,
          email: value,
          point: 0,
          image: url,
        };
      }

      const refreshToken = generateToken(data, refreshKey, "1d");

      if (!user) {
        await prisma.users.create({
          data: {
            image_url: url,
            username: displayName,
            email: value,
            refresh_token: refreshToken,
            point: 0,
            password: "-",
          },
        });
      }

      // set cookie with name "refreshToken"
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie("isLogin", true, {
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.redirect(CLIENT_URL);
    }
  );
};
