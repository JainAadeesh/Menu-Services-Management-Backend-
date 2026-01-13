const express = require("express");
const router = express.Router();
const addonController = require("../controllers/addonController");

router.post("/items/:itemId/addons", addonController.createAddon);
router.get("/items/:itemId/addons", addonController.getAddonsByItem);
router.patch("/addons/:id", addonController.updateAddon);
router.delete("/addons/:id", addonController.deleteAddon);

module.exports = router;
