
// ===== API CONFIG =====
const BIN_ID = '69f719f0aaba88219766a7e4';
const API_KEY = '$2a$10$hvFoAlEuUcVtZHxhD3hh1OhZY4EayfnpbLtHYoQbPjdc58UhVBxh2';
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

let skills = [];


let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchSkills() {
  const grid = document.getElementById('skills-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="spinner-container">
        <div class="spinner"></div>
        <p class="spinner-text">Finding freelancers for you...</p>
      </div>
    `;
  }

  try {
    const response = await fetch(BASE_URL + '/latest', {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    skills = data.record;
    renderSkills(skills);
    updateSkillCount(skills.length);
  } catch (error) {
    console.error('Error fetching skills:', error);
    if (grid) grid.innerHTML = '<p class="empty-state">Failed to load skills. Please refresh!</p>';
  }
}
function updateSkillCount(count) {
  const countEl = document.getElementById('skill-count');
  if (countEl) {
    countEl.innerHTML = `Showing <span>${count}</span> skill${count !== 1 ? 's' : ''}`;
  }
}

function renderSkills(list) {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.innerHTML = '<p class="empty-state">No skills found!</p>';
    return;
  }
  updateSkillCount(list.length);
  list.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.setAttribute('data-category', skill.category);
    card.innerHTML = `
      <div class="card-top">
        <img src="https://placehold.co/60x60" alt="${skill.name}" class="avatar">
        <div>
          <h3>${skill.title}</h3>
          <span class="category-tag">${skill.category}</span>
        </div>
      </div>
      <p class="card-desc">${skill.desc}</p>
      <div class="card-footer">
      <button class="btn" onclick="saveToFavorites
        <span class="price">₹${skill.price}</span>
        <div style="display:flex; gap:8px;">
          <button class="btn" onclick="saveToFavorites(${skill.id})">❤️</button>
          <a href="profile.html?id=${skill.id}" class="btn">View</a>
          <button class="btn btn-delete" onclick="deleteSkill(${skill.id})">🗑️</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function handleSearch() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtered = skills.filter(skill =>
    skill.title.toLowerCase().includes(query) ||
    skill.category.toLowerCase().includes(query) ||
    skill.name.toLowerCase().includes(query)
  );
  renderSkills(filtered);
}

function handleFilter(category) {
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  if (category === 'all') {
    renderSkills(skills);
  } else {
    renderSkills(skills.filter(skill => skill.category === category));
  }
}

function saveToFavorites(id) {
  const skill = skills.find(s => s.id === id);
  const already = favorites.find(f => f.id === id);
  if (already) { alert('Already in favorites!'); return; }
  favorites.push(skill);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert(`"${skill.title}" saved to favorites! ❤️`);
}

function renderFavorites() {
  const grid = document.getElementById('favorites-grid');
  if (!grid) return;
  if (favorites.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>😕 No favorites yet.</p>
        <p>Go to <a href="index.html">Home</a> and save some skills!</p>
      </div>`;
    return;
  }
  grid.innerHTML = '';
  favorites.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.innerHTML = `
      <div class="card-top">
        <img src="https://placehold.co/60x60" alt="${skill.name}" class="avatar">
        <div>
          <h3>${skill.title}</h3>
          <span class="category-tag">${skill.category}</span>
        </div>
      </div>
      <p class="card-desc">${skill.desc}</p>
      <div class="card-footer">
        <span class="price">₹${skill.price}</span>
        <button class="btn" onclick="removeFromFavorites(${skill.id})">🗑️ Remove</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function removeFromFavorites(id) {
  favorites = favorites.filter(f => f.id !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  renderFavorites();
}
  // ===== DELETE SKILL =====
async function deleteSkill(id) {
  if (!confirm('Are you sure you want to delete this skill?')) return;

  try {
    const getResponse = await fetch(BASE_URL + '/latest', {
      headers: { 'X-Master-Key': API_KEY }
    });
    const getData = await getResponse.json();
    const existingSkills = getData.record;

    const updated = existingSkills.filter(s => s.id !== id);

    await fetch(BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
      body: JSON.stringify(updated)
    });

    skills = updated;
    renderSkills(skills);
    showToast('Skill deleted! 🗑️', 'error');
  } catch (error) {
    showToast('Failed to delete. Try again!', 'error');
  }
}
}

async function handlePostSkill(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const title = document.getElementById('skill-title').value.trim();
  const category = document.getElementById('category').value;
  const desc = document.getElementById('description').value.trim();
  const price = document.getElementById('price').value;
  let valid = true;

  if (!name) { document.getElementById('name-error').textContent = 'Name is required'; valid = false; }
  else { document.getElementById('name-error').textContent = ''; }
  if (!title) { document.getElementById('title-error').textContent = 'Skill title is required'; valid = false; }
  else { document.getElementById('title-error').textContent = ''; }
  if (!category) { document.getElementById('category-error').textContent = 'Please select a category'; valid = false; }
  else { document.getElementById('category-error').textContent = ''; }
  if (!desc) { document.getElementById('desc-error').textContent = 'Description is required'; valid = false; }
  else { document.getElementById('desc-error').textContent = ''; }
  if (!price || price <= 0) { document.getElementById('price-error').textContent = 'Enter a valid price'; valid = false; }
  else { document.getElementById('price-error').textContent = ''; }

  if (!valid) return;

  try {
    // Fetch existing skills first
    const getResponse = await fetch(BASE_URL + '/latest', {
      headers: { 'X-Master-Key': API_KEY }
    });
    const getData = await getResponse.json();
    const existingSkills = getData.record;

    // Add new skill
    const newSkill = { id: Date.now(), name, title, category, desc, price: parseInt(price) };
    existingSkills.push(newSkill);

    // Save back to JSONBin
    await fetch(BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
      body: JSON.stringify(existingSkills)
    });

    alert(`Your skill "${title}" has been posted! 🚀`);
    window.location.href = 'index.html';
  } catch (error) {
    alert('Something went wrong. Please try again.');
  }
}

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
});

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('skills-grid')) {
    fetchSkills();
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keyup', e => {
      if (e.key === 'Enter') handleSearch();
    });
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        handleFilter(this.getAttribute('data-category'));
      });
    });
  }
  if (document.getElementById('favorites-grid')) renderFavorites();
  const form = document.getElementById('post-skill-form');
  if (form) form.addEventListener('submit', handlePostSkill);
});
// Profile page
if (document.getElementById('profile-name')) {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  async function loadProfile() {
    const response = await fetch(BASE_URL + '/latest', {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    const allSkills = data.record;
    const skill = allSkills.find(s => s.id === id);

    if (skill) {
      document.getElementById('profile-name').textContent = skill.name;
      document.getElementById('profile-category').textContent = skill.category;
      document.getElementById('profile-desc').textContent = skill.desc;
      document.getElementById('profile-price').textContent = '₹' + skill.price;
      document.getElementById('profile-cat-label').textContent = skill.category;
    }
  }

  loadProfile();

  document.getElementById('fav-btn').addEventListener('click', () => {
    showToast('Profile saved to favorites! ❤️');
  });
}