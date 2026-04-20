const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Static method to combine core enum categories with dynamic categories from DB
Category.getAllWithCore = async function () {
  const coreCategories = [
    { id: "Video Game", name: "Video Game", label: "Video Games", isCore: true },
    { id: "Console", name: "Console", label: "Consoles", isCore: true },
    { id: "Accessory", name: "Accessory", label: "Accessories", isCore: true },
  ];

  const dbCategories = await Category.findAll({
    where: { status: "Active" },
  });

  // Filter out any dbCategories that are duplicates of core names
  const coreNames = coreCategories.map((c) => c.name);
  const filteredDb = dbCategories.filter((c) => !coreNames.includes(c.name));

  // For dynamic categories, label is the same as name
  const labeledDb = filteredDb.map(c => ({
    ...c.toJSON(),
    label: c.name
  }));

  return [...coreCategories, ...labeledDb];
};

module.exports = Category;