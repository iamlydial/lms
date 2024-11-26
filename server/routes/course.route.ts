import express from "express";
import {
  editCourse,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizedRoles("admin"),
  uploadCourse
);

courseRouter.put(
  "/update-course/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  editCourse
);

courseRouter.get("/get-course/:id", getSingleCourse);
export default courseRouter;
