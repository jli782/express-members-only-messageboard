const User = require("../models/user");
const Message = require("../models/message");
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
  failureRedirect: "/users/sign-in-failure", //"/login-failure",
});

exports.get_sign_in_failure = asyncHandler(async (req, res, next) => {
  console.log(`failure req.user`, req.user);
  // res.send(`NOT IMPLEMENTED: SIGN IN FAILURE`);
  const err = { msg: `Incorrect username or password.` };
  res.render("user_sign_in", {
    err: err,
    user: undefined,
  });
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
    console.log(`existingUser ${existingUser}`);
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
        if (!existingUser.isAdmin) {
          const member = new User({
            membershipStatus: false,
            _id: req.user.id,
          });

          await User.findOneAndUpdate(
            { username: req.user.username },
            member,
            {}
          );
        }
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
    form_user: undefined,
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
          form_user: user,
          user: undefined,
          err: err.array(),
        });
        return;
      } else if (req.body.password !== req.body.confirm_password) {
        console.log(`comparing hash and hash2 ...`);
        // if (hash != hash2)) {
        //   console.log(`not same passwords ${bcrypt.compareSync(hash, hash2)}`);
        res.render("user_register", {
          err: { msg: `Password and Confirmed Password are not the same!` },
          form_user: user,
          user: undefined,
        });
        return;
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
  // res.send(`NOT IMPLEMENTED: get_profile ${req.params.id}`);
  console.log(`req.params.id ${req.params.id} | req.user.id ${req.user.id}`);
  // params user vs session user
  if (req.params.id === req.user.id) {
    res.render("user_profile", {
      title: "User Profile",
      err: undefined,
      user: req.user,
      user_to_delete: undefined,
    });
    return;
  } else {
    const user = await User.findById(req.params.id).exec();
    res.render("user_profile", {
      title: "User Profile",
      err: undefined,
      user: req.user,
      user_to_delete: user,
    });
  }
});
exports.update_profile_post = [
  body("first").trim().isLength({ min: 1 }).withMessage(`First name is empty.`),
  body("last").trim().isLength({ min: 1 }).withMessage(`Surname is empty.`),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage(`Username is empty.`),
  body("password")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1 })
    .withMessage(`Password is empty.`),
  body("confirm_password")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 1 })
    .withMessage(`Confirmed Password is empty.`),
  asyncHandler(async (req, res, next) => {
    // res.send(`NOT IMPLEMENTED: update_profile_post ${req.params.id}`);
    const err = validationResult(req);
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      const hash2 = bcrypt.hashSync(req.body.confirm_password, salt);
      console.log(`updating user ${req.params.id}`);
      console.log(`hash ${hash} | hash2 ${hash2}`);
      console.log(
        `req.body.password: ${req.body.password.length} | req.body.confirm_password: ${req.body.confirm_password.length}`
      );

      const updatedUser = new User({
        _id: req.user.id,
        fullName: {
          first: req.body.first,
          last: req.body.last,
        },
        username: req.body.username,
        password: hash, // hash the password here ...
        membershipStatus: req.user.membershipStatus,
      });
      if (
        req.body.password.length === 0 &&
        req.body.confirm_password.length === 0
      ) {
        updatedUser.password = req.user.password;
      }
      console.log(`updatedUser`, updatedUser);

      if (!err.isEmpty()) {
        err.array().map((e) => console.log(`updating user err: `, e));
        console.log(`err.msg ${err.msg}`);
        res.render("user_profile", {
          title: "User Profile",
          user: updatedUser,
          err: err.array(),
        });
        return;
      } else if (req.body.password !== req.body.confirm_password) {
        console.log(`comparing hash and hash2 ...`);
        res.render("user_profile", {
          title: "User Profile",
          err: { msg: `Password and Confirmed Password are not the same!` },
          user: updatedUser,
        });
        return;
      } else {
        console.log(`is it admin: ${req.user}`);
        if (req.user.isAdmin) {
          updatedUser.isAdmin = true;
          updatedUser.membershipStatus = true;
        }
        console.log(`maintaining admin status: ${req.user}`);
        await User.findOneAndUpdate({ _id: req.params.id }, updatedUser, {});
        console.log(`redirecting user to message board`);
        res.redirect("/message");
      }
    } catch (err) {
      return next(err);
    }
  }),
];

exports.get_profile_delete = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: get_profile_delete ${req.params.id}`);

  const deleteUser = await User.findById(req.params.id).exec();
  const deleteUserMessages = await Message.find(
    { postedBy: req.params.id },
    "title timestamp text"
  )
    .sort({ timestamp: 1 })
    .exec();

  if (!deleteUser) {
    res.redirect("/message");
  } else {
    console.log(
      `delete confirm : ${req.user} | ${deleteUser} | ${deleteUserMessages.length}`
    );
    res.render("user_confirm_delete", {
      title: "Deleting User",
      user_to_delete: deleteUser,
      messages_to_delete: deleteUserMessages,
      user: req.user,
      err: undefined,
    });
  }
});
exports.delete_profile_post = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: delete_profile_post ${req.params.id}`);
  const deleteUser = await User.findById(req.params.id).exec();

  const deleteUserMessages = await Message.find(
    { postedBy: req.params.id },
    "title timestamp text"
  )
    .sort({ timestamp: 1 })
    .exec();

  if (!deleteUser) {
    res.redirect("/message");
  } else if (deleteUserMessages.length > 0) {
    const err = {
      msg: `There are still ${deleteUserMessages.length} messages remaining to delete!`,
    };
    res.render("user_confirm_delete", {
      title: "Deleting User",
      user_to_delete: deleteUser,
      messages_to_delete: deleteUserMessages,
      user: req.user,
      err: err,
    });
    return;
  } else {
    console.log(
      `delete confirm : ${deleteUser} | will be deleted by admin: ${req.user}`
    );
    await User.findByIdAndDelete(req.params.id).exec();
    res.redirect("/message");
  }
});

exports.index = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED users_index`);
  const usersList = await User.find({ isAdmin: false })
    .sort({ username: 1 })
    .exec();
  res.render("users_list", {
    title: "List of Users",
    users: usersList,
    err: undefined,
    user: req.user,
  });
});
