function loadRecipes() {
    fetch('/api/recipes')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load recipes");
            }
            return response.json();
        })
        .then(recipes => {
            const table = document.getElementById('recipeTable');
            table.innerHTML = '';

            recipes.forEach(recipe => {
                const row = table.insertRow();

                row.insertCell().textContent = recipe.title;
                row.insertCell().textContent = recipe.category;
                row.insertCell().textContent = recipe.prepTime;

                const difficultyCell = row.insertCell();
                const tag = document.createElement('span');

                tag.className = recipe.difficulty === 'Medium'
                    ? 'tag medium'
                    : 'tag';

                tag.textContent = recipe.difficulty;
                difficultyCell.appendChild(tag);

                const actions = row.insertCell();

                const editButton = document.createElement('a');
                editButton.href = `edit-recipe.html?id=${recipe.id}`;
                editButton.className = 'small-btn';
                editButton.textContent = 'Edit';

                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'small-btn delete';
                deleteButton.textContent = 'Delete';

                deleteButton.onclick = function () {
                    deleteRecipe(recipe.id);
                };

                actions.appendChild(editButton);
                actions.appendChild(deleteButton);
            });
        })
        .catch(error => {
            console.error(error);
            alert("Cannot load recipes from backend");
        });
}

function deleteRecipe(id) {
    const recipeId = Number(id);

    if (!Number.isInteger(recipeId) || recipeId < 1) {
        alert("Invalid recipe ID.");
        return;
    }

    if (!confirm("Are you sure you want to delete this recipe?")) {
        return;
    }

    fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE'
    })
        .then(async response => {
            const text = await response.text();
            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error("The server returned an invalid response.");
                }
            }

            if (response.status === 400) {
                throw new Error("invalid-id");
            }
            if (response.status === 404) {
                throw new Error("not-found");
            }
            if (!response.ok) {
                throw new Error("delete-failed");
            }

            return data;
        })
        .then(data => {
            alert(data.message || "Recipe deleted.");
            loadRecipes();
        })
        .catch(error => {
            if (error.message === "invalid-id") {
                alert("Invalid recipe ID.");
            } else if (error.message === "not-found") {
                alert("Recipe not found; it may already be deleted.");
            } else {
                alert("Could not delete the recipe. Check the backend connection and try again.");
            }
        });
}

loadRecipes();
