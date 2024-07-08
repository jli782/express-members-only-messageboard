const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

exports.index = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: index - get list of message (message board)`);
  const messages = await Message.find({})
    .populate("postedBy", "username")
    .exec();
  console.log(`messages: ${messages} | user: ${req.user}`);

  res.render("message_board", {
    title: "Message Board",
    err: undefined,
    user: req.user,
    messages: messages,
  });
});

exports.get_message_form = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: get_message_form to create message`);
});
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
    // res.send(`NOT IMPLEMENTED: create_message`);
    const err = validationResult(req);
    const messages = await Message.find({})
      .populate("postedBy", "username")
      .exec();

    if (!err.isEmpty()) {
      err.array().map((err) => console.log(err));
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
      console.log(`posted message: ${message}`);

      await message.save();
      res.redirect("/message");
      return;
    }
  }),
];

exports.edit_message_get = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: edit_message_get ${req.params.id}`);
});
exports.edit_message = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: edit_message ${req.params.id}`);
});

exports.delete_message_get = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: delete_message_get ${req.params.id}`);
});
exports.delete_message = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: delete_message ${req.params.id}`);
});
