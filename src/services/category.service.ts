import Category, { ICategory } from "../models/category.model";

const CategoryService = {
    getAllCategories: async (): Promise<ICategory[]> => {
        return await Category.find();
    },
    getCategoryById: async (id: string): Promise<ICategory | null> => {
        return await Category.findById(id);
    },
    createCategory: async (categoryData: Partial<ICategory>): Promise<ICategory> => {
        const newCategory = new Category(categoryData);
        return await newCategory.save();
    },
    updateCategory: async (id: string, categoryData: Partial<ICategory>): Promise<ICategory | null> => {
        return await Category.findByIdAndUpdate(id, categoryData, { new: true });
    },
    deleteCategory: async (id: string): Promise<ICategory | null> => {
        return await Category.findByIdAndDelete(id);
    },
};

export default CategoryService;