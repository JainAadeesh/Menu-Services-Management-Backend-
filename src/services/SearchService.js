const Item = require("../models/Item");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");

class SearchService {
  async searchItems(filters = {}) {
    const {
      search,
      minPrice,
      maxPrice,
      categoryId,
      activeOnly = true,
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
    } = filters;

    // Build aggregation pipeline
    const pipeline = [];

    // Match active items
    const matchStage = { is_active: true };

    if (search) {
      matchStage.$text = { $search: search };
    }

    if (categoryId) {
      matchStage.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      matchStage["pricing.base_price"] = {};
      if (minPrice !== undefined) {
        matchStage["pricing.base_price"].$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        matchStage["pricing.base_price"].$lte = parseFloat(maxPrice);
      }
    }

    pipeline.push({ $match: matchStage });

    // Lookup subcategory
    pipeline.push({
      $lookup: {
        from: "subcategories",
        let: { subcatId: "$subcategoryId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$subcatId"] },
              is_active: true,
            },
          },
        ],
        as: "subcategory",
      },
    });

    // Lookup category
    pipeline.push({
      $lookup: {
        from: "categories",
        let: { catId: "$categoryId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$catId"] },
              is_active: true,
            },
          },
        ],
        as: "category",
      },
    });

    // Filter out items with inactive parents
    if (activeOnly) {
      pipeline.push({
        $match: {
          $or: [
            {
              subcategoryId: { $exists: true },
              "subcategory.0": { $exists: true },
            },
            {
              categoryId: { $exists: true },
              subcategoryId: { $exists: false },
              "category.0": { $exists: true },
            },
          ],
        },
      });
    }

    // Sort
    const sortStage = {};
    sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
    pipeline.push({ $sort: sortStage });

    // Count total
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Item.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const items = await Item.aggregate(pipeline);

    return {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new SearchService();
