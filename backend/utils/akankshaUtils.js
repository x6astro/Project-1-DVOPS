const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const fs = require('fs');
const path = require('path');
const { deleteRecipe } = require('./elliszaUtil');
const { updateRecipe } = require('./aniqUtil');

const dbPath = path.join(__dirname, 'utils', 'bakenest-db.json');
const frontendPath = path.join(__dirname, '..', 'frontend', 'public');

// Create the database automatically if it does not exist
if (!fs.existsSync(dbPath)) {
    fs.copyFileSync(
        path.join(__dirname, 'utils', 'bakenest-db-template.json'),
        dbPath
    );
}

let recipes = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

app.use(express.static(frontendPath));

// Get all recipes
app.get('/api/recipes', (req, res) => {
    res.json(recipes);
});

// Get single recipe by ID
app.get('/api/recipes/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid recipe ID" });
    }
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
});

// Delete recipe
app.delete('/api/recipes/:id', (req, res) => {
    deleteRecipe(req, res, recipes, dbPath);
});

// Update recipe
app.put('/api/recipes/:id', (req, res) => {
    updateRecipe(req, res, recipes, dbPath);
});

// Add recipe
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

    // Check for empty inputs
    if (
        !title || !category || !prepTime ||
        !difficulty || !description ||
        !ingredients || !steps
    ) {
        return res.status(400).json({
            message: "All recipe fields are required."
        });
    }

    // Validate title length
    if (title.trim().length < 3) {
        return res.status(400).json({
            message: "Recipe title must contain at least 3 characters."
        });
    }

    // Validate preparation time
    const duration = Number(prepTime);

    if (!Number.isInteger(duration) || duration < 1 || duration > 500) {
        return res.status(400).json({
            message: "Preparation time must be between 1 and 500 minutes."
        });
    }

    // Validate ingredient quantities
    if (!Array.isArray(ingredients) || ingredients.length === 0 ||
        ingredients.some(item => !item.trim() || !/\d/.test(item))) {
        return res.status(400).json({
            message: "Every ingredient must include a quantity."
        });
    }

    // Validate steps
    if (!Array.isArray(steps) || steps.length === 0 ||
        steps.some(step => !step.trim())) {
        return res.status(400).json({
            message: "Please provide valid recipe steps."
        });
    }

    // Generate unique recipe ID
    const newId = recipes.length > 0
        ? Math.max(...recipes.map(recipe => recipe.id)) + 1
        : 1;

    // Create new recipe
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

    // Save recipe
    recipes.push(newRecipe);

    fs.writeFileSync(dbPath, JSON.stringify(recipes, null, 2));

    res.status(201).json({
        message: "Recipe added successfully!",
        recipe: newRecipe
    });
}); 