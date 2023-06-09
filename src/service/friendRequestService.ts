import { FriendRequest } from "../modals/friendRequest";
import { RequestHandler } from "express";
import { successResponse, errorResponse } from "../helpers/Responses/index";
import { CONSTANTS } from "../helpers/Constants/index";
import { CustomRequest } from "../Interface/userInterface";
import User from "../modals/user";
import { IUser } from "../Interface/userInterface";
import _ from "lodash";

export const SendFriendRequestService: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  try {
    const userId = req.id!;
    const requestedToUserId = req.params.recipientid;
    if (userId === requestedToUserId)
      return res.status(400).send(successResponse(CONSTANTS.INVALID_REQUEST));
    const isRecipientUserExists = await User.findOne({
      _id: requestedToUserId,
      isDeleted: false,
    });
    if (isRecipientUserExists) {
      if (isRecipientUserExists.friendsList.includes(userId))
        return res.status(400).send(errorResponse(CONSTANTS.ALREADY_FRIENDS));
      await FriendRequest.create({
        requestedBy: userId,
        requestedTo: requestedToUserId,
      });
      return res.status(201).send(successResponse(CONSTANTS.SUCCESS));
    } else
      return res
        .status(400)
        .send(errorResponse(CONSTANTS.RECIPIENT_NOT_EXISTS));
  } catch (error) {
    next(error);
  }
};

export const acceptFriendRequestService: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  try {
    const userId = req.id;
    const actionType = req.params.actiontype;
    const recipientId = req.params.recipientid;

    if (+actionType !== 1 && +actionType !== 2)
      return res.status(200).send(successResponse(CONSTANTS.INVALID_REQUEST));

    const isRecordExists = await FriendRequest.findOne({
      requestedTo: userId,
      requestStatus: 0,
      requestedBy: recipientId,
    });
    if (isRecordExists) {
      const result = await FriendRequest.updateOne(
        {
          requestedTo: userId,
          requestStatus: 0,
          requestedBy: recipientId,
        },
        { requestStatus: +actionType },
        {
          new: true,
        }
      );
      if (result == null) {
        res.status(400).send(successResponse(CONSTANTS.INVALID_REQUEST));
      }
      if (+actionType === 1) {
        const addedFriend = await User.updateOne(
          { _id:  recipientId},
          { $push: { friendsList: userId } }
        );

        if (addedFriend.modifiedCount) {
          return res
            .status(200)
            .send(successResponse(CONSTANTS.FRIEND_REQUEST_ACCEPTED));
        } else {
          return res.status(400).send(errorResponse(CONSTANTS.INVALID_REQUEST));
        }
      } else {
        return res
          .status(200)
          .send(successResponse(CONSTANTS.FRIEND_REQUEST_DECLINED));
      }
    } else {
      return res.status(400).send(successResponse(CONSTANTS.INVALID_REQUEST));
    }
  } catch (error) {
    next(error);
  }
};

export const pendingFriendRequestListService: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  try {
    const userId = req.id;
    const pendindList = await FriendRequest.find({
      requestedTo: userId,
      requestStatus: 0,
    }).populate("requestedBy");
    return res.status(200).send(successResponse(pendindList));
  } catch (error) {
    next(error);
  }
};

export const friendsListService: RequestHandler = async (
  req: CustomRequest,
  res,
  next
) => {
  try {
    const userId = req.id;
    const result = await User.findOne({
      _id: userId,
      isDeleted: false,
    }).populate("friendsList");
    if (result) {
      const resData = result?.friendsList.map((data: any) => {
        const newData = { ...data._doc };
        delete newData?.password;
        delete newData?.isDeleted;
        delete newData?.isEmailVerified;
        delete newData?.token;
        delete newData?.friendsList;
        delete newData?.createdAt;
        delete newData?.updatedAt;
        delete newData?.__v;
        return newData;
      });
      res.status(200).send(successResponse(resData));
    } else res.status(400).send(errorResponse(CONSTANTS.UNSUCCESS));
  } catch (error) {
    next(error);
  }
};


