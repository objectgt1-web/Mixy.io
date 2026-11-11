
const games = [
  {
    name: "Shadow Runner",
    category: "Action",
    description: "An exciting action adventure. Explore a mysterious world.",
    emoji: "🥷",
    downloads: "Demo",
    color: "linear-gradient(135deg,#43206d,#130e24)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Lost Dimension",
    category: "Adventure",
    description: "Explore unknown dimensions and discover hidden secrets.",
    emoji: "🌌",
    downloads: "Demo",
    color: "linear-gradient(135deg,#123e65,#111329)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Dark Rooms",
    category: "Horror",
    description: "A mysterious horror experience. Can you find your way out?",
    emoji: "👻",
    downloads: "Demo",
    color: "linear-gradient(135deg,#5b1728,#160b17)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Pixel World",
    category: "Adventure",
    description: "Discover a colorful pixel world full of surprises.",
    emoji: "🕹️",
    downloads: "Demo",
    color: "linear-gradient(135deg,#17634e,#101e20)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Battle Zone",
    category: "Multiplayer",
    description: "Jump into a competitive multiplayer experience.",
    emoji: "⚔️",
    downloads: "Demo",
    color: "linear-gradient(135deg,#8b4a18,#27121a)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Space Explorer",
    category: "Other",
    description: "Travel through space and explore the unknown.",
    emoji: "🚀",
    downloads: "Demo",
    color: "linear-gradient(135deg,#273d82,#17122d)",
    creator: "MIXY.IO Demo"
  }
];

let selectedCategory = "All";

const gameGrid = document.getElementById("gameGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

function renderGames() {
  const search = searchInput.value.toLowerCase();

  const filtered = games.filter(game => {
    const matchesCategory =
      selectedCategory === "All" ||
      game.category === selectedCategory;

    const matchesSearch =
      game.name.toLowerCase().includes(search) ||
      game.description.toLowerCase().includes(search) ||
      game.category.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  gameGrid.innerHTML = filtered.map((game, index) => `
    <article class="game-card" onclick="openGame(${games.indexOf(game)})">
      <div class="game-cover" style="background:${game.color}">
        ${game.emoji}
        <span>${game.category.toUpperCase()}</span>
      </div>
      <div class="game-info">
        <h3>${escapeHTML(game.name)}</h3>
        <p>${escapeHTML(game.description)}</p>
        <div class="game-meta">
          <span>By ${escapeHTML(game.creator)}</span>
          <strong>DEMO</strong>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.hidden = filtered.length !== 0;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    button.classList.add("active");

    selectedCategory = button.dataset.category;
    renderGames();
  });
});

searchInput.addEventListener("input", renderGames);

function openAuth(type) {
  const signup = type === "signup";

  document.getElementById("modalTitle").textContent =
    signup ? "Create an account." : "Welcome back.";

  document.getElementById("modalDescription").textContent =
    signup ? "Join the MIXY.IO community." : "Log in to your account.";

  document.getElementById("authSubmit").textContent =
    signup ? "Create account" : "Log in";

  document.getElementById("username").hidden = !signup;
  document.getElementById("usernameLabel").hidden = !signup;
  document.getElementById("username").required = signup;

  document.getElementById("switchAuth").innerHTML = signup
    ? 'Already have an account? <button onclick="openAuth(\'login\')">Log in</button>'
    : 'New to MIXY.IO? <button onclick="openAuth(\'signup\')">Sign up</button>';

  document.getElementById("authForm").dataset.mode = type;

  const modal = document.getElementById("authModal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeAuth() {
  const modal = document.getElementById("authModal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

document.getElementById("authForm").addEventListener("submit", event => {
  event.preventDefault();

  alert("Supabase authentication is not connected yet. We'll enable accounts in the next step.");
});

function openGame(index) {
  const game = games[index];

  document.getElementById("gameDetails").innerHTML = `
    <div class="eyebrow">GAME PREVIEW</div>
    <h2>${escapeHTML(game.emoji)} ${escapeHTML(game.name)}</h2>
    <p>Category: ${escapeHTML(game.category)}</p>
    <p>${escapeHTML(game.description)}</p>
    <p>Creator: ${escapeHTML(game.creator)}</p>
    <p style="margin-top:15px">This is a sample listing. Real APK downloads will be available when creator uploads are connected.</p>
  `;

  const modal = document.getElementById("gameModal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeGame() {
  const modal = document.getElementById("gameModal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

document.getElementById("authModal").addEventListener("click", event => {
  if (event.target.id === "authModal") closeAuth();
});

document.getElementById("gameModal").addEventListener("click", event => {
  if (event.target.id === "gameModal") closeGame();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeAuth();
    closeGame();
  }
});

renderGames();
