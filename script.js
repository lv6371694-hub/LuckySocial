let currentUser = null;


/* =========================
   LOGIN / SIGNUP
========================= */

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
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Login failed");
      return;
    }

    currentUser = username;

    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("signupSection").classList.add("hidden");

    document.getElementById("feedSection").classList.remove("hidden");
    document.getElementById("bottomNav").classList.remove("hidden");

    document.getElementById("searchSection").classList.add("hidden");

    loadPosts();

  } catch (error) {

    console.error(error);
    alert("Server se connection nahi ho raha");

  }
}


async function signup() {

  const username =
    document.getElementById("signupUsername").value.trim();

  const password =
    document.getElementById("signupPassword").value;

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
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
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


/* =========================
   FEED
========================= */

async function loadPosts() {

  document.getElementById("feedSection").classList.remove("hidden");
  document.getElementById("searchSection").classList.add("hidden");

  const postsContainer =
    document.getElementById("posts");

  try {

    const response =
      await fetch("/api/posts");

    if (!response.ok) {

      postsContainer.innerHTML =
        "<p>Posts load nahi ho rahe.</p>";

      return;
    }

    const posts =
      await response.json();

    if (!posts || posts.length === 0) {

      postsContainer.innerHTML = `
        <div style="
          padding:40px;
          text-align:center;
          color:#777
        ">
          <h3>No posts yet</h3>
          <p>Apna pehla post create karo.</p>
        </div>
      `;

      return;
    }

    postsContainer.innerHTML =
      posts.map(post => `

        <article style="
          background:#fff;
          border-bottom:1px solid #ddd;
          margin-top:10px;
        ">

          <div style="
            padding:12px;
            font-weight:bold;
          ">
            👤 ${escapeHTML(
              post.username ||
              post.user ||
              "Lucky"
            )}
          </div>

          ${
            post.image
            ? `
              <img
                src="${post.image}"
                style="width:100%;display:block;"
              >
            `
            : ""
          }

          <div style="padding:12px">

            <div style="
              font-size:24px;
              margin-bottom:8px;
            ">
              ♡ 💬 ↗
            </div>

            <div>
              ${escapeHTML(
                post.text ||
                post.content ||
                ""
              )}
            </div>

          </div>

        </article>

      `).join("");

  } catch (error) {

    console.error(error);

    postsContainer.innerHTML = `
      <div style="
        padding:30px;
        text-align:center;
        color:#777
      ">
        Posts load nahi ho rahe.
      </div>
    `;

  }
}


/* =========================
   CREATE POST
========================= */

async function createPost() {

  const text =
    document.getElementById("postText").value.trim();

  if (!text) {

    alert("Post me kuch likho");
    return;

  }

  try {

    const response =
      await fetch("/api/posts", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          username:
            currentUser || "Lucky",

          text: text

        })

      });

    const data =
      await response.json();

    if (!response.ok || !data.success) {

      alert(
        data.message ||
        "Post create nahi hua"
      );

      return;
    }

    document.getElementById("postText").value = "";

    hideCreate();

    loadPosts();

  } catch (error) {

    console.error(error);

    alert(
      "Server se connection nahi ho raha"
    );

  }
}


function showCreate() {

  document
    .getElementById("createBox")
    .classList.remove("hidden");

}


function hideCreate() {

  document
    .getElementById("createBox")
    .classList.add("hidden");

}


/* =========================
   SEARCH
========================= */

function showSearch() {

  if (!currentUser) {

    alert("Pehle login karo");
    return;

  }

  document
    .getElementById("feedSection")
    .classList.add("hidden");

  document
    .getElementById("searchSection")
    .classList.remove("hidden");

  document
    .getElementById("searchInput")
    .focus();

}


async function searchUsers() {

  const input =
    document.getElementById("searchInput");

  const results =
    document.getElementById("searchResults");

  const q =
    input.value.trim();

  if (!q) {

    results.innerHTML = "";
    return;

  }

  results.innerHTML =
    "<p>Searching...</p>";

  try {

    const response =
      await fetch(
        "/api/users/search?q=" +
        encodeURIComponent(q)
      );

    const data =
      await response.json();

    if (!response.ok || !data.success) {

      results.innerHTML =
        "<p>Search failed</p>";

      return;
    }

    if (
      !data.users ||
      data.users.length === 0
    ) {

      results.innerHTML =
        "<p>User nahi mila</p>";

      return;
    }

    results.innerHTML =
      data.users.map(user => {

        const isFollowing =
          Array.isArray(user.followers) &&
          user.followers.includes(currentUser);

        const isMe =
          user.username === currentUser;

        return `

          <div style="
            padding:14px;
            margin-bottom:10px;
            background:#fff;
            border:1px solid #ddd;
            border-radius:10px;
            display:flex;
            justify-content:space-between;
            align-items:center;
          ">

            <div>

              <strong>
                @${escapeHTML(user.username)}
              </strong>

              <div style="
                font-size:13px;
                color:#777;
                margin-top:5px;
              ">

                Followers:
                ${
                  Array.isArray(user.followers)
                  ? user.followers.length
                  : 0
                }

              </div>

            </div>

            ${
              isMe

              ? `
                <span style="
                  color:#777;
                  font-size:13px;
                ">
                  You
                </span>
              `

              : `

                <button
                  onclick="toggleFollow('${escapeHTML(user.username)}')"
                  style="
                    padding:8px 14px;
                    border:none;
                    border-radius:8px;
                    cursor:pointer;
                  "
                >
                  ${
                    isFollowing
                    ? "Following"
                    : "Follow"
                  }
                </button>

              `
            }

          </div>

        `;

      }).join("");

  } catch (error) {

    console.error(error);

    results.innerHTML =
      "<p>Server se connection nahi ho raha</p>";

  }

}


/* =========================
   FOLLOW / UNFOLLOW
========================= */

async function toggleFollow(username) {

  if (!currentUser) {

    alert("Pehle login karo");
    return;

  }

  try {

    const response =
      await fetch(
        "/api/users/" +
        encodeURIComponent(username) +
        "/follow",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            currentUser: currentUser
          })

        }
      );

    const data =
      await response.json();

    if (!response.ok || !data.success) {

      alert(
        data.message ||
        "Follow failed"
      );

      return;
    }

    alert(
      data.following
      ? "Followed successfully"
      : "Unfollowed successfully"
    );

    searchUsers();

  } catch (error) {

    console.error(error);

    alert(
      "Server se connection nahi ho raha"
    );

  }

}


/* =========================
   PROFILE
========================= */

function loadProfile() {

  if (!currentUser) {

    alert("Pehle login karo");
    return;

  }

  alert(
    "Profile: @" +
    currentUser
  );

}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value ?? "";

  return div.innerHTML;

}
