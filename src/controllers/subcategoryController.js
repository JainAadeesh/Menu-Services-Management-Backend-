const Subcategory = require("../models/Subcategory");
const Category = require("../models/Category");
const {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} = require("../config/constants");

exports.createSubcategory = async (req, res, next) => {
  try {
    const {
      categoryId,
      name,
      image,
      description,
      tax_applicable,
      tax_percentage,
    } = req.body;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category || !category.is_active) {
      return res.status(404).json({
        success: false,
        message: "Category not found or inactive",
      });
    }

    const subcategory = await Subcategory.create({
      categoryId,
      name,
      image,
      description,
      tax_applicable,
      tax_percentage,
    });

    res.status(201).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubcategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const sortBy = req.query.sort || "name";
    const sortOrder = req.query.order === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const filter = { is_active: true };
    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }

    const [subcategories, total] = await Promise.all([
      Subcategory.find(filter)
        .populate("categoryId", "name is_active")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Subcategory.countDocuments(filter),
    ]);

    // Filter out subcategories with inactive parents
    const activeSubcategories = subcategories.filter(
      (subcat) => subcat.categoryId && subcat.categoryId.is_active
    );

    res.json({
      success: true,
      data: activeSubcategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubcategoryById = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "categoryId",
      "name is_active"
    );

    if (!subcategory || !subcategory.is_active) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    if (!subcategory.categoryId || !subcategory.categoryId.is_active) {
      return res.status(404).json({
        success: false,
        message: "Subcategory parent is inactive",
      });
    }

    res.json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSubcategory = async (req, res, next) => {
  try {
    const updates = req.body;

    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.json({
      success: true,
      message: "Subcategory deactivated successfully",
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};
