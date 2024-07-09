const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();

exports.get_sign_in = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: get_sign_in`);
  res.render("user_sign_in", {
    err: undefined,
    user: undefined,
  });
});

/* 
asyncHandler(async (req, res, next) => {
  // upon sign in, should verify the user's membershipStatus
  // true, show messages with details on who posted the message
  // false, show messages without details
  res.send(`NOT IMPLEMENTED: post_sign_in`);
});
 */
exports.post_sign_in = passport.authenticate("local", {
  successRedirect: "/users/verify-membership",
  failureRedirect: "/", //"/login-failure",
});

exports.get_membership_verification = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: get_membership_verification`);
  console.log(`get_membership_verification: ${req.user}`);
  res.render("user_verify_membership", {
    title: `Verify Membership`,
    err: undefined,
    user: req.user,
  });
});
exports.post_membership_verification = [
  body("is_member")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Membership is empty"),
  asyncHandler(async (req, res, next) => {
    // res.send(`NOT IMPLEMENTED: post_membership_verification`);
    const err = validationResult(req);

    console.log(`process.env.MEMBERSHIP_KEY ${process.env.MEMBERSHIP_KEY}`);
    process.env.MEMBERSHIP_KEY.split(";").map((key) => {
      console.log(`membership_key `, key);
    });
    console.log(`is_member: ${req.body.is_member}`);
    console.log(`req.user.id ${req.user.id}`);
    const existingUser = await User.findOne({ _id: req.user.id });
    // if user exists, check membership status and admin status ... TODO
    if (!err.isEmpty()) {
      console.log(req.user);
      res.render("user_verify_membership", {
        title: `Verify Membership`,
        err: err.array(),
        user: req.user,
      });
    } else {
      if (
        process.env.ADMIN_KEY === req.body.is_member &&
        process.env.MEMBERSHIP_KEY.split(";").find(
          (key) => key === req.body.is_member
        ) !== undefined
      ) {
        const admin = new User({
          membershipStatus: true,
          isAdmin: true,
          _id: req.user.id,
        });
        await User.findOneAndUpdate({ username: req.user.username }, admin, {});
        // res.render("message_board", {
        //   title: "Admin Message Board",
        //   err: undefined,
        //   user: admin,
        // });
        res.redirect("/message");
      } else if (
        process.env.MEMBERSHIP_KEY.split(";").find(
          (key) => key === req.body.is_member
        ) !== undefined
      ) {
        const member = new User({
          membershipStatus: true,
          _id: req.user.id,
        });

        await User.findOneAndUpdate(
          { username: req.user.username },
          member,
          {}
        );
        // res.render("message_board", {
        //   title: "Verified Member Message Board",
        //   err: undefined,
        //   user: member,
        // });
        res.redirect("/message");
      } else {
        const member = new User({
          membershipStatus: false,
          _id: req.user.id,
        });

        await User.findOneAndUpdate(
          { username: req.user.username },
          member,
          {}
        );
        res.redirect("/message");
      }
    }
  }),
];
exports.get_sign_out = asyncHandler(async (req, res, next) => {
  console.log(`signing out ${req.user}`);
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

exports.get_register = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: get_register`);
  res.render("user_register", {
    err: undefined,
    user: undefined,
  });
});
exports.post_register = [
  body("first").trim().isLength({ min: 1 }).withMessage(`First name is empty.`),
  body("last").trim().isLength({ min: 1 }).withMessage(`Surname is empty.`),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage(`Username is empty.`),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage(`Password is empty.`),
  body("confirm_password")
    .trim()
    .isLength({ min: 1 })
    .withMessage(`Confirmed Password is empty.`),
  asyncHandler(async (req, res, next) => {
    // res.send(`NOT IMPLEMENTED: post_register`);
    const err = validationResult(req);
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      const hash2 = bcrypt.hashSync(req.body.confirm_password, salt);
      console.log(`posting a new user`);
      console.log(`hash ${hash} | hash2 ${hash2}`);

      const user = new User({
        fullName: {
          first: req.body.first,
          last: req.body.last,
        },
        username: req.body.username,
        password: hash, // hash the password here ...
      });
      console.log(`user`, user);

      if (!err.isEmpty()) {
        res.render("user_register", {
          user: user,
          err: err.array(),
        });
      }
      console.log(`comparing hash and hash2 ...`);
      if (req.body.password !== req.body.confirm_password) {
        // if (hash != hash2)) {
        //   console.log(`not same passwords ${bcrypt.compareSync(hash, hash2)}`);
        res.render("user_register", {
          err: { msg: `Password and Confirmed Password are not the same!` },
          user: user,
        });
      } else {
        await user.save();
        console.log(`redirecting user to login`);
        res.redirect("/users"); // redirects user to login
      }
    } catch (err) {
      return next(err);
    }
  }),
];

exports.get_profile = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: get_profile ${req.params.id}`);
});
exports.update_profile_post = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: update_profile_post ${req.params.id}`);
});

exports.get_profile_delete = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: get_profile_delete ${req.params.id}`);
});
exports.delete_profile_post = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: delete_profile_post ${req.params.id}`);
});
