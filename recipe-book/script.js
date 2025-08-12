const recipeForm = document.getElementById('recipe-form');
const recipesGrid = document.getElementById('recipes-grid');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('recipe-modal');
const closeModal = document.querySelector('.close');

let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

function saveRecipes() {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

recipeForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('recipe-name').value.trim();
  const ingredientsText = document.getElementById('ingredients').value.trim();
  const steps = document.getElementById('steps').value.trim();
  const imageInput = document.getElementById('recipe-image');
  const file = imageInput.files[0];

  if (!name || !ingredientsText || !steps) {
    alert('Please fill in all required fields.');
    return;
  }

  const ingredients = ingredientsText.split('\n').map(ing => ing.trim()).filter(ing => ing);

  let imageUrl = 'https://via.placeholder.com/300x180?text=No+Image';
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imageUrl = e.target.result;

      const newRecipe = {
        id: Date.now(),
        name,
        ingredients,
        steps,
        image: imageUrl
      };

      recipes.unshift(newRecipe); 
      saveRecipes();
      renderRecipes(recipes);
      recipeForm.reset();
    };
    reader.readAsDataURL(file);
  } else {
    const newRecipe = {
      id: Date.now(),
      name,
      ingredients,
      steps,
      image: imageUrl
    };

    recipes.unshift(newRecipe);
    saveRecipes();
    renderRecipes(recipes);
    recipeForm.reset();
  }
});

function renderRecipes(recipeList) {
  recipesGrid.innerHTML = '';

  if (recipeList.length === 0) {
    const noRecipes = document.createElement('p');
    noRecipes.className = 'no-recipes';
    noRecipes.textContent = 'No recipes found. Add your first recipe!';
    recipesGrid.appendChild(noRecipes);
    return;
  }

  recipeList.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.id = recipe.id;

    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}" />
      <div class="info">
        <h3>${recipe.name}</h3>
        <p>${recipe.ingredients.slice(0, 3).join(', ')}</p>
      </div>
    `;

    card.addEventListener('click', () => openRecipeModal(recipe));
    recipesGrid.appendChild(card);
  });
}

function openRecipeModal(recipe) {
  document.getElementById('modal-title').textContent = recipe.name;
  document.getElementById('modal-image').src = recipe.image;
  document.getElementById('modal-steps').textContent = recipe.steps;

  const ingredientsList = document.getElementById('modal-ingredients');
  ingredientsList.innerHTML = '';
  recipe.ingredients.forEach(ing => {
    const li = document.createElement('li');
    li.textContent = ing;
    ingredientsList.appendChild(li);
  });

  modal.style.display = 'flex';
}

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    renderRecipes(recipes);
    return;
  }

  const filtered = recipes.filter(recipe => {
    const matchesName = recipe.name.toLowerCase().includes(query);
    const matchesIngredient = recipe.ingredients.some(ing =>
      ing.toLowerCase().includes(query)
    );
    return matchesName || matchesIngredient;
  });

  renderRecipes(filtered);

  if (filtered.length === 0) {
    const noResults = document.createElement('p');
    noResults.className = 'no-recipes';
    noResults.textContent = `No recipes found matching "${query}".`;
    recipesGrid.appendChild(noResults);
  }
});

renderRecipes(recipes);