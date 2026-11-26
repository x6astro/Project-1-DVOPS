
// READ - Irfan's backend functions

// Get all recipes
function getAllRecipes(req, res, recipes) {
    try {
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({
            message: "Failed to load recipes."
        });
    }
}

// Get recipe by ID
function getRecipeById(req, res, recipes) {
    try {
        const id = Number(req.params.id);

        // Error: Invalid recipe ID
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid recipe ID"
            });
        }

        const recipe = recipes.find(r => r.id === id);

        // Error: Recipe not found
        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        res.status(200).json(recipe);

    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve recipe."
        });
    }
}

module.exports = {
    getAllRecipes,
    getRecipeById
};
