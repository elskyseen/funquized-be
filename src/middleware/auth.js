import jwt from "jsonwebtoken";

// handle middleware
export const authMiddleware = (req, res, next) => {
  // get authorization from header
  const authHeader = req.headers["authorization"];

  // split token from authorization
  const token = authHeader && authHeader.split(" ")[1];

  // get access key from env
  const accessKey = process.env.SECRET_KEY;

  // verify token from user
  jwt.verify(token, accessKey, (err, decode) => {
    if (err) {
      return res.status(401).json({ message: "User Unauthorized" });
    }
    next();
  });
};
