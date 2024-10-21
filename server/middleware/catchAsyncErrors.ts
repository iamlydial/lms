import { Request, Response, NextFunction } from "express";

export const CatchAsyncError =
  (
    theFunc: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };

//theFunc: This parameter is intended to represent any function that follows
//the Express route handler signature (i.e., it takes req, res, and next as arguments)

//(req, res, next) is the inner function is the function that is returned by CatchAsyncError.
//It's the one that gets executed when a request is made to a route wrapped with CatchAsyncError.

// theFunc(req, res, next): Inside the inner function, the route handler (theFunc) is called with
// req, res, and next. This is not the inner function itself, but rather the invocation of theFunc,
// which is your actual route handler logic.
