
function loadRecipes() {
    fetch('http://localhost:3000/api/recipes')
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

                // Difficulty tag
                const difficultyCell = row.insertCell();
                const tag = document.createElement('span');

                tag.className = recipe.difficulty === 'Medium'
                    ? 'tag medium'
                    : 'tag';

                tag.textContent = recipe.difficulty;
                difficultyCell.appendChild(tag);

                // Action buttons
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
            console.log(error);
            alert("Cannot load recipes from backend");
        });
}

function deleteRecipe(id) {
    if (confirm("Are you sure you want to delete this recipe?")) {

        fetch(`http://localhost:3000/api/recipes/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to delete recipe");
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                loadRecipes();
            })
            .catch(error => {
                alert(error.message);
            });
    }
}

// Load recipes when page opens
loadRecipes();
