const form = document.getElementById('recipeForm');
const errorsDiv = document.getElementById('errorMessages');

// 1. Get ID from URL
const id = new URLSearchParams(location.search).get('id');
if (!id) {
    errorsDiv.textContent = "Missing recipe ID";
    form.style.display = 'none';
}

// 2. Load recipe & fill form
fetch(`/api/recipes/${id}`)
    .then(r => r.json())
    .then(recipe => {
        document.getElementById('title').value = recipe.title;
        document.getElementById('time').value = recipe.prepTime.replace(/\D/g, '');
        document.getElementById('category').value = recipe.category;
        document.getElementById('difficulty').value = recipe.difficulty;
        document.getElementById('description').value = recipe.description || '';
        document.getElementById('imageLink').value = recipe.imageLink || '';
        document.getElementById('ingredients').value = (recipe.ingredients || []).join('\n');
        document.getElementById('steps').value = (recipe.steps || []).join('\n');
    })
    .catch(() => {
        errorsDiv.textContent = "Failed to load recipe";
        form.style.display = 'none';
    });

// 3. Handle submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorsDiv.textContent = '';

    const data = {
        title: document.getElementById('title').value.trim(),
        prepTime: Number(document.getElementById('time').value),
        category: document.getElementById('category').value,
        difficulty: document.getElementById('difficulty').value,
        description: document.getElementById('description').value.trim(),
        imageLink: document.getElementById('imageLink').value.trim(),
        ingredients: document.getElementById('ingredients').value.split('\n').map(s => s.trim()).filter(Boolean),
        steps: document.getElementById('steps').value.split('\n').map(s => s.trim()).filter(Boolean)
    };

    // Basic validation (let backend handle the rest)
    if (!data.title || !data.prepTime || !data.category || !data.difficulty || !data.description || !data.ingredients.length || !data.steps.length) {
        errorsDiv.textContent = "Please fill all fields";
        return;
    }

    const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        errorsDiv.textContent = result.message || "Update failed";
    } else {
        alert(result.message);
        location.href = 'recipes.html';
    }
});