
const SUPABASE_URL = "https://vrbtneqfibpnkffknpjm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__1Rias6NsIkph8mRM6s00A_siuLqGS";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// DEMO GAMES
const games = [
  {
    name: "Shadow Runner",
    category: "Action",
    description: "Explore a mysterious world.",
    emoji: "🥷",
    color: "linear-gradient(135deg,#43206d,#130e24)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Lost Dimension",
    category: "Adventure",
    description: "Explore unknown dimensions.",
    emoji: "🌌",
    color: "linear-gradient(135deg,#123e65,#111329)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Dark Rooms",
    category: "Horror",
    description: "Find your way out of the darkness.",
    emoji: "👻",
    color: "linear-gradient(135deg,#5b1728,#160b17)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Pixel World",
    category: "Adventure",
    description: "Discover a colorful pixel world.",
    emoji: "🕹️",
    color: "linear-gradient(135deg,#17634e,#101e20)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Battle Zone",
    category: "Multiplayer",
    description: "Enter a competitive experience.",
    emoji: "⚔️",
    color: "linear-gradient(135deg,#8b4a18,#27121a)",
    creator: "MIXY.IO Demo"
  },
  {
    name: "Space Explorer",
    category: "Other",
    description: "Explore the unknown.",
    emoji: "🚀",
    color: "linear-gradient(135deg,#273d82,#17122d)",
    creator: "MIXY.IO Demo"
  }
];

// GAME DISCOVERY
let selectedCategory = "All";

const gameGrid = document.getElementById("gameGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderGames() {
  const search = searchInput.value.toLowerCase().trim();

  const filtered = games.filter(game => {
    const categoryMatch =
      selectedCategory === "All" ||
      game.category === selectedCategory;

    const searchMatch =
      game.name.toLowerCase().includes(search) ||
      game.description.toLowerCase().includes(search) ||
      game.category.toLowerCase().includes(search);

    return categoryMatch && searchMatch;
  });

  gameGrid.innerHTML = filtered.map(game => `
    <article class="game-card" onclick="openGame(${games.indexOf(game)})">
      <div class="game-cover" style="background:${game.color}">
        ${game.emoji}
        <span>${escapeHTML(game.category.toUpperCase())}</span>
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

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    button.classList.add("active");
    selectedCategory = button.dataset.category;
    renderGames();
  });
});

searchInput.addEventListener("input", renderGames);

// GAME DETAILS
function openGame(index) {
  const game = games[index];
  if (!game) return;

  document.getElementById("gameDetails").innerHTML = `
    <div class="eyebrow">GAME PREVIEW</div>
    <h2>${escapeHTML(game.emoji)} ${escapeHTML(game.name)}</h2>
    <p>Category: ${escapeHTML(game.category)}</p>
    <p>${escapeHTML(game.description)}</p>
    <p>Creator: ${escapeHTML(game.creator)}</p>
    <p style="margin-top:15px">
      Sample listing. Published games will appear here when connected.
    </p>
  `;

  document.getElementById("gameModal").classList.add("show");
  document.getElementById("gameModal").setAttribute("aria-hidden", "false");
}

function closeGame() {
  document.getElementById("gameModal").classList.remove("show");
  document.getElementById("gameModal").setAttribute("aria-hidden", "true");
}

// AUTHENTICATION MODAL
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
    ? 'Already have an account? <button type="button" onclick="openAuth(\'login\')">Log in</button>'
    : 'New to MIXY.IO? <button type="button" onclick="openAuth(\'signup\')">Sign up</button>';

  document.getElementById("authForm").dataset.mode = type;

  document.getElementById("authModal").classList.add("show");
  document.getElementById("authModal").setAttribute("aria-hidden", "false");
}

function closeAuth() {
  document.getElementById("authModal").classList.remove("show");
  document.getElementById("authModal").setAttribute("aria-hidden", "true");
}

// SIGNUP AND LOGIN
const authForm = document.getElementById("authForm");

authForm.addEventListener("submit", async event => {
  event.preventDefault();

  const mode = authForm.dataset.mode;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value.trim();
  const submitButton = document.getElementById("authSubmit");

  submitButton.disabled = true;
  submitButton.textContent = "Please wait...";

  try {
    if (mode === "signup") {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        throw new Error("Username must be 3-20 characters and contain only letters, numbers or underscores.");
      }

      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;

      if (data.session) {
        alert("Account created! Welcome to MIXY.IO.");
        closeAuth();
      } else {
        alert("Account created! Check your email to confirm your account before logging in.");
      }

      authForm.reset();
    }

    if (mode === "login") {
      const { error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      alert("Successfully logged in!");
      closeAuth();
      authForm.reset();
    }
  } catch (error) {
    alert(error.message || "Something went wrong.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent =
      mode === "signup" ? "Create account" : "Log in";
  }
});

// ACCOUNT NAVIGATION
const navActions = document.querySelector(".nav-actions");
const originalNav = navActions.innerHTML;

function updateAccount(user) {
  navActions.innerHTML = "";

  if (!user) {
    navActions.innerHTML = originalNav;
    return;
  }

  const greeting = document.createElement("span");
  greeting.style.cssText =
    "color:#c5a0ff;font-size:12px;align-self:center";

  greeting.textContent =
    "@" + (user.user_metadata?.username || user.email);

  const developerLink = document.createElement("a");
  developerLink.href = "developer.html";
  developerLink.textContent = "Developer Portal";
  developerLink.style.cssText =
    "color:#c5a0ff;font-size:13px;text-decoration:none;align-self:center";

  const logout = document.createElement("button");
  logout.className = "signup-btn";
  logout.textContent = "Log out";

  logout.addEventListener("click", async () => {
    const { error } = await db.auth.signOut();

    if (error) {
      alert(error.message);
    }
  });

  navActions.append(greeting, developerLink, logout);
}

// RESTORE SESSION
async function initializeAccount() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    console.error(error.message);
    return;
  }

  updateAccount(data.session?.user || null);
}

db.auth.onAuthStateChange((event, session) => {
  updateAccount(session?.user || null);
});

initializeAccount();

// MODAL CONTROLS
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

// START WEBSITE
renderGames();
