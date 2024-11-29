import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import { CourseModel, ICourse } from "../models/course.model";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { newOrder } from "../services/order.service";
import { send } from "process";
import path from "path";

//create order
export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;
      const user = await userModel.findById(req.user?._id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const courseExistInUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );

      if (courseExistInUser) {
        return next(
          new ErrorHandler("You have already purchased this course", 400)
        );
      }

      const course: ICourse | null = await CourseModel.findById(courseId);

      if (!course) {
        new ErrorHandler("Course not found", 400);
      }

      const data: any = {
        courseId: course?._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.courses.push(course?._id);

      await user?.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New order",
        message: `You have a new order from ${course?.name}`,
      });

      course.purchased ? course.purchased += 1 : course.purchased

      await course.save();

      newOrder(data, res, next);

    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
