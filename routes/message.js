const express = require("express");
const router = express.Router();
const message = require("../controllers/messageController");

router.get("/", message.index);
router.get("/create", message.get_message_form);
router.post("/create", message.create_message);
router.get("/edit/:id", message.edit_message_get);
router.post("/edit/:id", message.edit_message);
router.get("/delete/:id", message.delete_message_get);
router.post("/delete/:id", message.delete_message);

module.exports = router;
