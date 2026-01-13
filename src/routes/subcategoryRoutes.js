const express = require("express");
const router = express.Router();
const subcategoryController = require("../controllers/subcategoryController");

router.post("/", subcategoryController.createSubcategory);
router.get("/", subcategoryController.getSubcategories);
router.get("/:id", subcategoryController.getSubcategoryById);
router.patch("/:id", subcategoryController.updateSubcategory);
router.delete("/:id", subcategoryController.deleteSubcategory);

module.exports = router;
