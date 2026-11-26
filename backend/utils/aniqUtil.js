const fs = require('fs');

function updateRecipe(req, res, recipes, dbPath) {
    const id = Number(req.params.id);

    // Error 1: Invalid ID format (not a positive integer)
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid recipe ID"
        });
    }

    const index = recipes.findIndex(recipe => recipe.id === id);

    // Error 2: Recipe not found 
    if (index === -1) {
        return res.status(404).json({
            message: "Recipe not found"
        });
    }

    // Get updated data from request body
    const {
        title,
        category,
        prepTime,
        difficulty,
        description,
        imageLink,
        ingredients,
        steps
    } = req.body;

    // Error 3: Validation - check all required fields
    if (
        !title || !category || !prepTime ||
        !difficulty || !description ||
        !ingredients || !steps
    ) {
        return res.status(400).json({
            message: "All recipe fields are required."
        });
    }

    // Validation: title length
    if (title.trim().length < 3) {
        return res.status(400).json({
            message: "Recipe title must contain at least 3 characters."
        });
    }

    //Validation: preparation time
    const duration = Number(prepTime);
    if (!Number.isInteger(duration) || duration < 1 || duration > 500) {
        return res.status(400).json({
            message: "Preparation time must be between 1 and 500 minutes."
        });
    }

    //Validation: ingredient quantities
    if (!Array.isArray(ingredients) || ingredients.length === 0 ||
        ingredients.some(item => !item.trim() || !/\d/.test(item))) {
        return res.status(400).json({
            message: "Every ingredient must include a quantity."
        });
    }

    //Validation: steps
    if (!Array.isArray(steps) || steps.length === 0 ||
        steps.some(step => !step.trim())) {
        return res.status(400).json({
            message: "Please provide valid recipe steps."
        });
    }

    // Success: Update the recipe
    const updatedRecipe = {
        id: id,
        title: title.trim(),
        category,
        prepTime: `${duration} mins`,
        difficulty,
        description: description.trim(),
        imageLink: typeof imageLink === 'string' ? imageLink.trim() : '',
        ingredients,
        steps
    };

    recipes[index] = updatedRecipe;

    try {
        fs.writeFileSync(dbPath, JSON.stringify(recipes, null, 2));
        return res.json({
            message: "Recipe updated successfully!",
            recipe: updatedRecipe
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update recipe"
        });
    }
}

module.exports = {
    updateRecipe
};