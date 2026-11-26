
const recipeForm = document.getElementById('recipeForm');
const errorMessages = document.getElementById('errorMessages');

recipeForm.addEventListener('submit', function(event) {

    event.preventDefault();

    errorMessages.innerHTML = '';

    // Get form values
    const title = document.getElementById('title').value.trim();
    const prepTime = document.getElementById('time').value.trim();
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const description = document.getElementById('description').value.trim();

    const ingredients = document.getElementById('ingredients')
        .value.split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');

    const steps = document.getElementById('steps')
        .value.split('\n')
        .map(step => step.trim())
        .filter(step => step !== '');

    let errors = [];

    // Error scenario 1: No inputs added
    const allFieldsEmpty =
        !title &&
        !prepTime &&
        !category &&
        !difficulty &&
        !description &&
        ingredients.length === 0 &&
        steps.length === 0;

    if (allFieldsEmpty) {
        errors.push("Please fill in all recipe details before submitting.");
    }

    else {

        // Error scenario 2: Missing required inputs
        if (!title || !prepTime || !category ||
            !difficulty || !description ||
            ingredients.length === 0 || steps.length === 0) {

            errors.push("Please complete all required fields.");
        }

        // Error scenario 3: Missing ingredient quantity
        if (ingredients.some(item => !/\d/.test(item))) {
            errors.push("Each ingredient must include a quantity (e.g. 100g flour).");
        }

        // Error scenario 4: Title too short
        if (title.length > 0 && title.length < 3) {
            errors.push("Recipe title must contain at least 3 characters.");
        }

        // Error scenario 5: Invalid preparation time
        const duration = Number(prepTime);

        if (prepTime && (!Number.isInteger(duration) ||
            duration < 1 || duration > 500)) {

            errors.push("Preparation time must be between 1 and 500 minutes.");
        }
    }

    // Display validation errors
    if (errors.length > 0) {

        errorMessages.innerHTML = errors
            .map(error => `<p>${error}</p>`)
            .join('');

        errorMessages.style.color = 'red';

        return;
    }

    // Prepare recipe data
    const recipeData = {
        title,
        prepTime: Number(prepTime),
        category,
        difficulty,
        description,
        imageLink: document.getElementById('imageLink').value.trim(),
        ingredients,
        steps
    };

    // Send recipe to backend
    fetch('/api/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
    })
    .then(response => {
        return response.json().then(data => {

            if (!response.ok) {
                throw new Error(data.message || "Failed to add recipe.");
            }

            return data;
        });
    })
    .then(data => {

        alert(data.message);

        recipeForm.reset();

        errorMessages.innerHTML = '';

    })
    .catch(error => {

        errorMessages.textContent = error.message;
        errorMessages.style.color = 'red';

    });

});

// Clear validation messages when form is reset
recipeForm.addEventListener('reset', function() {
    errorMessages.innerHTML = '';
});

