const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");

class TaxService {
  async resolveTax(item) {
    // If item has explicit tax config, use it
    if (item.tax_applicable !== null) {
      return {
        applicable: item.tax_applicable,
        percentage: item.tax_percentage || 0,
      };
    }

    // If item belongs to subcategory
    if (item.subcategoryId) {
      const subcategory = await Subcategory.findById(item.subcategoryId);

      if (!subcategory) {
        throw new Error("Subcategory not found");
      }

      if (subcategory.tax_applicable !== null) {
        return {
          applicable: subcategory.tax_applicable,
          percentage: subcategory.tax_percentage || 0,
        };
      }

      // Inherit from category
      const category = await Category.findById(subcategory.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }

      return {
        applicable: category.tax_applicable,
        percentage: category.tax_percentage || 0,
      };
    }

    // Item belongs directly to category
    if (item.categoryId) {
      const category = await Category.findById(item.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }

      return {
        applicable: category.tax_applicable,
        percentage: category.tax_percentage || 0,
      };
    }

    // Default: no tax
    return {
      applicable: false,
      percentage: 0,
    };
  }
}

module.exports = new TaxService();
