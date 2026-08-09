let currentUser = null;

function showSignup() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("signupSection").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("signupSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Username aur password enter karo");
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    currentUser = username;

    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("signupSection").classList.add("hidden");
    document.getElementById("feedSection").classList.remove("hidden");
    document.getElementById("bottomNav").classList.remove("hidden");

    loadPosts();

  } catch (error) {
    console.error(error);
    alert("Server se connection nahi ho raha");
  }
}

async function signup() {
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (!username || !password) {
    alert("Username aur password enter karo");
    return;
  }

  try {
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    alert("Account successfully created!");

    document.getElementById("signupUsername").value = "";
    document.getElementById("signupPassword").value = "";

    showLogin();

  } catch (error) {
    console.error(error);
    alert("Server se connection nahi ho raha");
  }
}

async function loadPosts() {
  const postsContainer = document.getElementById("posts");

  try {
    const response = await fetch("/api/posts");

    if (!response.ok) {
      postsContainer.innerHTML = "<p>Posts load nahi ho rahe.</p>";
      return;
    }

    const posts = await response.json();

    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = `
        <div style="padding:40px;text-align:center;color:#777">
          <h3>No posts yet</h3>
          <p>Apna pehla post create karo.</p>
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = posts.map(post => `
      <article style="
        background:#fff;
        border-bottom:1px solid #ddd;
        margin-top:10px;
      ">
        <div style="
          padding:12px;
          font-weight:bold;
        ">
          👤 ${escapeHTML(post.username || post.user || "Lucky")}
        </div>

        ${
          post.image
          ? `<img src="${post.image}" style="width:100%;display:block;">`
          : ""
        }

        <div style="padding:12px">
          <div style="font-size:24px;margin-bottom:8px">
            ♡ 💬 ↗
          </div>

          <div>
            ${escapeHTML(post.text || post.content || "")}
          </div>
        </div>
      </article>
    `).join("");

  } catch (error) {
    console.error(error);

    postsContainer.innerHTML = `
      <div style="padding:30px;text-align:center;color:#777">
        Posts load nahi ho rahe.
      </div>
    `;
  }
}

async function createPost() {
  const text = document.getElementById("postText").value.trim();

  if (!text) {
    alert("Post me kuch likho");
    return;
  }

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: currentUser || "Lucky",
        text: text
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Post create nahi hua");
      return;
    }

    document.getElementById("postText").value = "";

    hideCreate();
    loadPosts();

  } catch (error) {
    console.error(error);
    alert("Server se connection nahi ho raha");
  }
}

function showCreate() {
  document.getElementById("createBox").classList.remove("hidden");
}

function hideCreate() {
  document.getElementById("createBox").classList.add("hidden");
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}
