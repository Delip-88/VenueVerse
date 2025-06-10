import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categories: [String]
});

export const Categories = mongoose.model("Categories", categorySchema);

