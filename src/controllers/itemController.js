const Item = require("../models/Item");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const PricingService = require("../services/PricingService");
const SearchService = require("../services/SearchService");
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require("../config/constants");

exports.createItem = async (req, res, next) => {
  try {
    const itemData = req.body;

    // Validate parent exists and is active
    if (itemData.categoryId) {
      const category = await Category.findById(itemData.categoryId);
      if (!category || !category.is_active) {
        return res.status(404).json({
          success: false,
          message: "Category not found or inactive",
        });
      }
    }

    if (itemData.subcategoryId) {
      const subcategory = await Subcategory.findById(itemData.subcategoryId);
      if (!subcategory || !subcategory.is_active) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found or inactive",
        });
      }
    }

    const item = await Item.create(itemData);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

exports.getItems = async (req, res, next) => {
  try {
    const result = await SearchService.searchItems(req.query);

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

exports.getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("categoryId", "name is_active")
      .populate("subcategoryId", "name is_active");

    if (!item || !item.is_active) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check parent status
    if (item.categoryId && !item.categoryId.is_active) {
      return res.status(404).json({
        success: false,
        message: "Item parent is inactive",
      });
    }

    if (item.subcategoryId && !item.subcategoryId.is_active) {
      return res.status(404).json({
        success: false,
        message: "Item parent is inactive",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const updates = req.body;

    const item = await Item.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Item deactivated successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

exports.getItemPrice = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item || !item.is_active) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const context = {
      quantity: req.query.quantity ? parseInt(req.query.quantity) : 1,
      requestTime: req.query.requestTime
        ? new Date(req.query.requestTime)
        : new Date(),
      addonIds: req.query.addons || [],
    };

    const priceDetails = await PricingService.calculatePrice(item, context);

    res.json({
      success: true,
      item: {
        id: item._id,
        name: item.name,
      },
      pricing: priceDetails,
    });
  } catch (error) {
    next(error);
  }
};
