import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
import { redis } from "../utils/redis";

//authenticated user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. extract the access token from cookies
    const access_token = req.cookies.access_token as string;

    // 2. check if access token exists
    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resourse", 400)
      );
    }

    // 3. verifies the JWT access_token using the secret key
    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as jwt.JwtPayload;

    // 4. if token is invalid return an error
    if (!decoded) {
      return next(new ErrorHandler("Access token is not valid", 400));
    }
    // 5. get the user from redis using the decoded token
    const user = await redis.get(decoded.id);

    // 6. check if the user is there
    if (!user) {
      return next(new ErrorHandler("user not found", 400));
    }
    // 7.Parse the user data to assign to req.user
    req.user = JSON.parse(user);

    // 8. Call next to pass control to the next middleware on the logout route handler
    next();
  }
);

//validate user role
export const authorizedRoles = (...roles: string[]) => {
  //returns another middleware function that receives req, res, and next
  return (req: Request, res: Response, next: NextFunction) => {
    //This middleware checks if the user's role is included in the roles array
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed toaccess this resource`,
          403
        )
      );
    }
    next()
  };
};
