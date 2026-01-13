const Addon = require("../models/Addon");
const Item = require("../models/Item");

exports.createAddon = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const addonData = { ...req.body, itemId };

    // Verify item exists
    const item = await Item.findById(itemId);
    if (!item || !item.is_active) {
      return res.status(404).json({
        success: false,
        message: "Item not found or inactive",
      });
    }

    const addon = await Addon.create(addonData);

    res.status(201).json({
      success: true,
      data: addon,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddonsByItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const addons = await Addon.find({
      itemId,
      is_active: true,
    });

    // Group by group_name if present
    const grouped = {};
    const ungrouped = [];

    addons.forEach((addon) => {
      if (addon.group_name) {
        if (!grouped[addon.group_name]) {
          grouped[addon.group_name] = {
            group_name: addon.group_name,
            selection_type: addon.group_selection_type,
            max_selections: addon.max_selections,
            addons: [],
          };
        }
        grouped[addon.group_name].addons.push(addon);
      } else {
        ungrouped.push(addon);
      }
    });

    res.json({
      success: true,
      data: {
        grouped: Object.values(grouped),
        ungrouped,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAddon = async (req, res, next) => {
  try {
    const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Addon not found",
      });
    }

    res.json({
      success: true,
      data: addon,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAddon = async (req, res, next) => {
  try {
    const addon = await Addon.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Addon not found",
      });
    }

    res.json({
      success: true,
      message: "Addon deactivated successfully",
      data: addon,
    });
  } catch (error) {
    next(error);
  }
};
