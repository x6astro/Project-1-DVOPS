const recipeGrid = document.querySelector('.recipe-grid');
const searchInput = document.querySelector('.search-row input');
const searchButton = document.querySelector('.search-row button');
const categoryButtons = document.querySelectorAll('.category-row button');
let allRecipes = [];
let selectedCategory = 'All';

function showRecipes(recipes) {
    recipeGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const card = document.createElement('article');
        card.className = 'recipe-card';

        const image = document.createElement('img');
        image.src = recipe.imageLink || 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop';
        image.className = 'recipe-image';
        image.alt = recipe.title;

        const content = document.createElement('div');
        content.className = 'content';
        const title = document.createElement('h3');
        title.textContent = recipe.title;
        const info = document.createElement('p');
        info.className = 'recipe-info';
        info.textContent = `${recipe.category} · ${recipe.prepTime} · ${recipe.difficulty}`;
        const link = document.createElement('a');
        link.href = `recipe-details.html?id=${recipe.id}`;
        link.textContent = 'View Recipe →';

        content.append(title, info, link);
        card.append(image, content);
        recipeGrid.appendChild(card);
    });
}

function searchRecipes() {
    const keyword = searchInput.value.trim().toLowerCase();

    // Alert 1: User clicks Search with no keyword.
    if (!keyword) {
        alert('Please enter a recipe name to search.');
        return;
    }

    const results = allRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(keyword) &&
        (selectedCategory === 'All' || recipe.category.toLowerCase() === selectedCategory.toLowerCase())
    );

    // Alert 2: User searches for a recipe that does not exist.
    if (results.length === 0) {
        alert('No recipes found. Please try another keyword.');
    }
    showRecipes(results);
}

function loadRecipes() {
    fetch('/api/recipes')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load recipes');
            return response.json();
        })
        .then(recipes => {
            if (!Array.isArray(recipes)) throw new Error('Invalid recipe data');
            allRecipes = recipes;
            showRecipes(recipes);
            if (recipes.length === 0) recipeGrid.textContent = 'No recipes available yet.';
        })
        .catch(error => {
            console.error(error);
            alert('Unable to load recipes. Please check the server and try again.');
            recipeGrid.textContent = 'Unable to load recipes. Please try again later.';
        });
}

searchButton.addEventListener('click', searchRecipes);
searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') searchRecipes();
});

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(item => item.classList.remove('selected'));
        button.classList.add('selected');
        selectedCategory = button.textContent.trim();
        // Category selection is a READ filter, not a new recipe.
        const results = allRecipes.filter(recipe =>
            selectedCategory === 'All' || recipe.category.toLowerCase() === selectedCategory.toLowerCase()
        );
        showRecipes(results);
        if (results.length === 0) recipeGrid.textContent = 'No recipes in this category yet.';
        searchInput.value = '';
    });
});

loadRecipes();
