
// Main BakeNest server
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { deleteRecipe } = require('./backend/utils/elliszaUtil');
const { updateRecipe } = require('./backend/utils/aniqUtil');
const { getAllRecipes, getRecipeById } = require('./backend/utils/irfanUtils');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// File paths
const dbPath = path.join(__dirname, 'backend', 'utils', 'bakenest-db.json');
const frontendPath = path.join(__dirname, 'frontend', 'public');

// Create database automatically if missing
if (!fs.existsSync(dbPath)) {
    fs.copyFileSync(
        path.join(__dirname, 'backend', 'utils', 'bakenest-db-template.json'),
        dbPath
    );
}

let recipes = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Serve frontend
app.use(express.static(frontendPath));

// READ - Get all recipes
app.get('/api/recipes', (req, res) => {
    getAllRecipes(req, res, recipes);
});

// READ - Get recipe by ID
app.get('/api/recipes/:id', (req, res) => {
    getRecipeById(req, res, recipes);
});

// DELETE - Delete recipe
app.delete('/api/recipes/:id', (req, res) => {
    deleteRecipe(req, res, recipes, dbPath);
});

// UPDATE - Update recipe
app.put('/api/recipes/:id', (req, res) => {
    updateRecipe(req, res, recipes, dbPath);
});

// CREATE - Add recipe
app.post('/api/recipes', (req, res) => {

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

    if (
        !title || !category || !prepTime ||
        !difficulty || !description ||
        !ingredients || !steps
    ) {
        return res.status(400).json({
            message: "All recipe fields are required."
        });
    }

    if (title.trim().length < 3) {
        return res.status(400).json({
            message: "Recipe title must contain at least 3 characters."
        });
    }

    const duration = Number(prepTime);

    if (!Number.isInteger(duration) || duration < 1 || duration > 500) {
        return res.status(400).json({
            message: "Preparation time must be between 1 and 500 minutes."
        });
    }

    if (
        !Array.isArray(ingredients) ||
        ingredients.length === 0 ||
        ingredients.some(item => !item.trim() || !/\d/.test(item))
    ) {
        return res.status(400).json({
            message: "Every ingredient must include a quantity."
        });
    }

    if (
        !Array.isArray(steps) ||
        steps.length === 0 ||
        steps.some(step => !step.trim())
    ) {
        return res.status(400).json({
            message: "Please provide valid recipe steps."
        });
    }

    const newId = recipes.length > 0
        ? Math.max(...recipes.map(recipe => recipe.id)) + 1
        : 1;

    const newRecipe = {
        id: newId,
        title: title.trim(),
        category,
        prepTime: `${duration} mins`,
        difficulty,
        description: description.trim(),
        imageLink: typeof imageLink === 'string' ? imageLink.trim() : '',
        ingredients,
        steps
    };

    recipes.push(newRecipe);
    fs.writeFileSync(dbPath, JSON.stringify(recipes, null, 2));

    res.status(201).json({
        message: "Recipe added successfully!",
        recipe: newRecipe
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
