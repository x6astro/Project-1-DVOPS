const fs = require('fs');

function deleteRecipe(req, res, recipes, dbPath) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid recipe ID"
        });
    }

    const index = recipes.findIndex(recipe => recipe.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Recipe not found"
        });
    }

    const deletedRecipe = recipes[index];

    try {
        recipes.splice(index, 1);
        fs.writeFileSync(dbPath, JSON.stringify(recipes, null, 2));

        return res.json({
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        recipes.splice(index, 0, deletedRecipe);
        return res.status(500).json({
            message: "Failed to delete recipe"
        });
    }
}

module.exports = {
    deleteRecipe
};
