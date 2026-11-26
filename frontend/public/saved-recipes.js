// Display the recipes saved in this browser.
const recipeGrid = document.querySelector('.recipe-grid');
const savedCount = document.getElementById('savedCount');
const emptyMessage = document.getElementById('savedEmpty');
const defaultImage = 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop';

function getSavedIds() {
    try {
        return JSON.parse(localStorage.getItem('bakenestSavedRecipes') || '[]');
    } catch (error) {
        return [];
    }
}

function showEmpty(message) {
    recipeGrid.innerHTML = '';
    emptyMessage.hidden = false;
    savedCount.textContent = message || '0 saved recipes';
}

function loadSavedRecipes() {
    const savedIds = getSavedIds();
    if (savedIds.length === 0) {
        showEmpty();
        return;
    }

    fetch('/api/recipes')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load recipes');
            return response.json();
        })
        .then(recipes => {
            if (!Array.isArray(recipes)) throw new Error('Invalid recipe data');
            const savedRecipes = recipes.filter(recipe => savedIds.includes(recipe.id));
            if (savedRecipes.length === 0) {
                showEmpty('0 available saved recipes');
                return;
            }
            emptyMessage.hidden = true;
            savedCount.textContent = `${savedRecipes.length} saved recipe${savedRecipes.length === 1 ? '' : 's'}`;
            recipeGrid.innerHTML = '';

            savedRecipes.forEach(recipe => {
                const card = document.createElement('article');
                card.className = 'recipe-card';
                const image = document.createElement('img');
                image.src = recipe.imageLink || defaultImage;
                image.alt = recipe.title;
                const content = document.createElement('div');
                content.className = 'content';
                const title = document.createElement('h3');
                title.textContent = recipe.title;
                const info = document.createElement('p');
                info.className = 'recipe-info';
                info.textContent = `${recipe.category} · ${recipe.prepTime} · ${recipe.difficulty}`;
                const actions = document.createElement('div');
                actions.className = 'saved-actions';
                const link = document.createElement('a');
                link.href = `recipe-details.html?id=${recipe.id}`;
                link.textContent = 'View Recipe →';
                const remove = document.createElement('button');
                remove.className = 'small-btn';
                remove.type = 'button';
                remove.textContent = 'Remove Saved';
                remove.onclick = () => {
                    if (!confirm('Remove this recipe from your saved recipes?')) return;
                    const remaining = getSavedIds().filter(id => id !== recipe.id);
                    localStorage.setItem('bakenestSavedRecipes', JSON.stringify(remaining));
                    loadSavedRecipes();
                };
                actions.append(link, remove);
                content.append(title, info, actions);
                card.append(image, content);
                recipeGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error(error);
            alert('Unable to load saved recipes. Please try again.');
            savedCount.textContent = '';
            emptyMessage.hidden = true;
            recipeGrid.textContent = 'Unable to load saved recipes.';
        });
}

loadSavedRecipes();
