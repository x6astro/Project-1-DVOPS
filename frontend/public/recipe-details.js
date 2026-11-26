const defaultImage = 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop';
const saveButton = document.querySelector('.btn-light');
let currentRecipe = null;

function loadRecipeDetails() {
    const params = new URLSearchParams(window.location.search);
    const recipeId = Number(params.get('id'));

    // Alert 3: User opens a missing or invalid recipe link.
    if (!Number.isInteger(recipeId) || recipeId < 1) {
        alert('Invalid recipe link. Please select a recipe from the Recipes page.');
        document.getElementById('recipeTitle').textContent = 'Recipe not found';
        saveButton.disabled = true;
        return;
    }

    fetch(`/api/recipes/${recipeId}`)
        .then(response => {
            if (response.status === 404 || response.status === 400) {
                throw new Error('Recipe not found. It may have been deleted.');
            }
            if (!response.ok) throw new Error('Unable to load recipe. Please try again.');
            return response.json();
        })
        .then(recipe => {
            currentRecipe = recipe;
            document.getElementById('recipeTitle').textContent = recipe.title;
            document.getElementById('recipeImage').src = recipe.imageLink || defaultImage;
            document.getElementById('recipeInfo').textContent = `◷ ${recipe.prepTime} · ${recipe.difficulty}`;
            document.getElementById('recipeDescription').textContent = recipe.description || 'No description available.';

            const ingredientsList = document.getElementById('recipeIngredients');
            ingredientsList.innerHTML = '';
            (recipe.ingredients || []).forEach(ingredient => {
                const li = document.createElement('li');
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                label.append(checkbox, document.createTextNode(' ' + ingredient));
                li.appendChild(label);
                ingredientsList.appendChild(li);
            });

            const stepsList = document.getElementById('recipeSteps');
            stepsList.innerHTML = '';
            (recipe.steps || []).forEach(step => {
                const li = document.createElement('li');
                li.textContent = step;
                stepsList.appendChild(li);
            });
        })
        .catch(error => {
            console.error(error);
            alert(error.message);
            document.getElementById('recipeTitle').textContent = 'Recipe not found';
            saveButton.disabled = true;
        });
}

saveButton.addEventListener('click', () => {
    if (!currentRecipe) return;

    // Save IDs locally until the project has login/accounts.
    const savedIds = JSON.parse(localStorage.getItem('bakenestSavedRecipes') || '[]');
    if (savedIds.includes(currentRecipe.id)) {
        alert('You have already saved this recipe.');
        return;
    }
    savedIds.push(currentRecipe.id);
    localStorage.setItem('bakenestSavedRecipes', JSON.stringify(savedIds));
    alert('Recipe saved successfully!');
    if (confirm('Would you like to view your Saved Recipes?')) {
        window.location.href = 'saved-recipes.html';
    }
});

loadRecipeDetails();
