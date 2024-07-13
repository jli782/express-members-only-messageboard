const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const debug = require("debug")("message");

exports.index = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({})
    .populate("postedBy", "username")
    .exec();
  debug(`messages: ${messages} | user: ${req.user}`);

  if (!req.user) {
    res.redirect("/");
  } else {
    res.render("message_board", {
      title: "Message Board",
      err: undefined,
      user: req.user,
      messages: messages,
    });
  }
});

// exports.get_message_form = asyncHandler(async (req, res, next) => {
//   res.send(`NOT IMPLEMENTED: get_message_form to create message`);
// });
exports.create_message = [
  body(`text`)
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage(`User message is empty`),
  body(`title`)
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage(`Title is empty`),
  asyncHandler(async (req, res, next) => {
    const err = validationResult(req);
    const messages = await Message.find({})
      .populate("postedBy", "username")
      .exec();

    if (!err.isEmpty()) {
      err.array().map((err) => debug(err));
      res.render("message_board", {
        title: "Message Board",
        err: err.array(),
        user: req.user,
        messages: messages,
      });
      return;
    } else {
      const message = new Message({
        title: req.body.title,
        text: req.body.text,
        timestamp: new Date(),
        postedBy: req.user,
      });
      debug(`posted message: ${message}`);

      await message.save();
      res.redirect("/message");
      return;
    }
  }),
];

exports.edit_message_get = asyncHandler(async (req, res, next) => {
  const message = await Message.findOne({ _id: req.params.id }).exec();
  if (!message) {
    res.redirect("/message");
    return;
  } else {
    res.render("user_edit_message", {
      title: "Editing Message",
      user: req.user,
      message: message,
      err: undefined,
    });
  }
});
exports.edit_message = [
  body(`text`)
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage(`User message is empty`),
  body(`title`)
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage(`Title is empty`),
  asyncHandler(async (req, res, next) => {
    const err = validationResult(req);

    const updatedMessage = new Message({
      _id: req.params.id,
      title: req.body.title,
      text: req.body.text,
      timestamp: new Date(),
      postedBy: req.user,
    });
    if (!err.isEmpty()) {
      debug(`error when updating message`);
      err.array().map((err) => debug(err));
      res.render("user_edit_message", {
        title: "Editing Message",
        user: req.user,
        message: updatedMessage,
        err: err.array(),
      });
      return;
    } else {
      debug(`updated message: ${updatedMessage}`);

      await Message.findOneAndUpdate(
        { _id: req.params.id },
        updatedMessage,
        {}
      ).exec();
      res.redirect("/message");
      return;
    }
  }),
];

// exports.delete_message_get = asyncHandler(async (req, res, next) => {
//   res.send(`NOT IMPLEMENTED: delete_message_get ${req.params.id}`);
// });

exports.delete_message = asyncHandler(async (req, res, next) => {
  await Message.findByIdAndDelete(req.params.id);
  res.redirect("/message");
});
