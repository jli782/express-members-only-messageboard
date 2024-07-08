const express = require("express");
const router = express.Router();
const user = require("../controllers/userController.js");
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get("/", user.get_sign_in);
router.post("/", user.post_sign_in);
router.get("/verify-membership", user.get_membership_verification);
router.post("/verify-membership", user.post_membership_verification);
router.get("/sign-out", user.get_sign_out);

router.get("/register", user.get_register);
router.post("/register", user.post_register);

router.get("/profile/:id", user.get_profile);
router.post("/profile/:id", user.update_profile_post);

router.get("/profile/:id/delete", user.get_profile_delete);
router.post("/profile/:id/delete", user.delete_profile_post);

module.exports = router;
