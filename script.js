/* =========================================================
   LuckySocial - Full Frontend Script
   ========================================================= */

const API = "/api";

let currentUser = localStorage.getItem("luckysocial_user") || null;
let currentProfileUsername = null;
let currentPostId = null;
let currentChatUsername = null;


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function hideAllSections() {
  const sections = [
    "loginSection",
    "signupSection",
    "feedSection",
    "searchSection",
    "profileSection",
    "notificationsSection",
    "messagesSection",
    "profileUsersSection"
  ];

  sections.forEach(id => {
    const el = $(id);
    if (el) el.classList.add("hidden");
  });
}

function showBottomNav() {
  const nav = $("bottomNav");
  if (nav) nav.classList.remove("hidden");
}

function hideBottomNav() {
  const nav = $("bottomNav");
  if (nav) nav.classList.add("hidden");
}

function escapeHTML(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("luckysocial_token");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Request failed (${response.status})`
    );
  }

  return data;
}

function showMessage(message) {
  alert(message);
}


/* =========================================================
   AUTH
   ========================================================= */

function showSignup() {
  $("loginSection")?.classList.add("hidden");
  $("signupSection")?.classList.remove("hidden");
}

function showLogin() {
  $("signupSection")?.classList.add("hidden");
  $("loginSection")?.classList.remove("hidden");
}

async function signup() {
  const username = $("signupUsername")?.value.trim();
  const password = $("signupPassword")?.value;

  if (!username || !password) {
    showMessage("Username aur password dono bharo.");
    return;
  }

  if (username.length < 3) {
    showMessage("Username kam se kam 3 characters ka hona chahiye.");
    return;
  }

  if (password.length < 4) {
    showMessage("Password kam se kam 4 characters ka rakho.");
    return;
  }

  try {
    const data = await apiFetch(`${API}/signup`, {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });

    showMessage(
      data.message || "Account successfully create ho gaya."
    );

    $("signupUsername").value = "";
    $("signupPassword").value = "";

    showLogin();

  } catch (error) {
    showMessage(error.message);
  }
}


async function login() {
  const username = $("username")?.value.trim();
  const password = $("password")?.value;

  if (!username || !password) {
    showMessage("Username aur password bharo.");
    return;
  }

  try {
    const data = await apiFetch(`${API}/login`, {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });

    if (!data.token) {
      throw new Error(
        data.message || "Login failed. Token nahi mila."
      );
    }

    localStorage.setItem(
      "luckysocial_token",
      data.token
    );

    const user =
      data.user?.username ||
      data.username ||
      username;

    currentUser = user;

    localStorage.setItem(
      "luckysocial_user",
      currentUser
    );

    $("username").value = "";
    $("password").value = "";

    await loadPosts();

  } catch (error) {
    showMessage(error.message);
  }
}


function logout() {
  localStorage.removeItem("luckysocial_token");
  localStorage.removeItem("luckysocial_user");

  currentUser = null;
  currentProfileUsername = null;
  currentChatUsername = null;

  hideAllSections();
  hideBottomNav();

  $("loginSection")?.classList.remove("hidden");

  hideLogout();
}

function showLogout() {
  $("logoutBox")?.classList.remove("hidden");
}

function hideLogout() {
  $("logoutBox")?.classList.add("hidden");
}


/* =========================================================
   HOME / FEED
   ========================================================= */

async function loadPosts() {
  hideAllSections();
  $("feedSection")?.classList.remove("hidden");
  showBottomNav();

  const postsContainer = $("posts");

  if (!postsContainer) return;

  postsContainer.innerHTML = `
    <div class="loading">
      Loading posts...
    </div>
  `;

  try {
    const data = await apiFetch(`${API}/posts`);

    let posts = [];

    if (Array.isArray(data)) {
      posts = data;
    } else if (Array.isArray(data.posts)) {
      posts = data.posts;
    } else if (Array.isArray(data.data)) {
      posts = data.data;
    }

    if (!posts.length) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No posts yet</h3>
          <p>Create your first post!</p>
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = posts
      .map(post => renderPost(post))
      .join("");

  } catch (error) {
    postsContainer.innerHTML = `
      <div class="error-box">
        ${escapeHTML(error.message)}
      </div>
    `;
  }
}


/* =========================================================
   POST RENDER
   ========================================================= */

function renderPost(post) {
  const postId =
    post.id ||
    post._id ||
    "";

  const username =
    post.username ||
    post.user?.username ||
    post.author ||
    "User";

  const text =
    post.text ||
    post.caption ||
    post.content ||
    "";

  const likes =
    post.likesCount ??
    post.likes?.length ??
    post.likeCount ??
    0;

  const comments =
    post.commentsCount ??
    post.comments?.length ??
    post.commentCount ??
    0;

  const liked =
    post.liked ||
    post.isLiked ||
    (
      Array.isArray(post.likes) &&
      currentUser &&
      post.likes.includes(currentUser)
    );

  const image =
    post.image ||
    post.imageUrl ||
    post.mediaUrl ||
    null;

  const created =
    post.createdAt ||
    post.created_at ||
    "";

  let imageHTML = "";

  if (image) {
    const imageURL =
      image.startsWith("http")
        ? image
        : image.startsWith("/media/")
          ? image
          : `/media/${encodeURIComponent(image)}`;

    imageHTML = `
      <img
        class="post-image"
        src="${escapeHTML(imageURL)}"
        alt="Post image"
        loading="lazy"
        onerror="this.style.display='none'"
      >
    `;
  }

  return `
    <article class="post-card" data-post-id="${escapeHTML(postId)}">

      <div class="post-header">

        <button
          class="post-user"
          onclick="loadProfile('${escapeHTML(username)}')"
        >
          <span class="avatar">
            ${escapeHTML(username.charAt(0).toUpperCase())}
          </span>

          <strong>
            ${escapeHTML(username)}
          </strong>
        </button>

      </div>

      ${imageHTML}

      <div class="post-actions">

        <button
          onclick="likePost('${escapeHTML(postId)}')"
          aria-label="Like"
        >
          ${liked ? "❤️" : "♡"}
        </button>

        <button
          onclick="showComments('${escapeHTML(postId)}')"
          aria-label="Comments"
        >
          💬
        </button>

        <button
          onclick="sharePost('${escapeHTML(postId)}')"
          aria-label="Share"
        >
          ↗
        </button>

      </div>

      <div class="post-info">

        <strong>
          ${likes} likes
        </strong>

        <p class="post-text">
          <strong>${escapeHTML(username)}</strong>
          ${escapeHTML(text)}
        </p>

        <button
          class="view-comments"
          onclick="showComments('${escapeHTML(postId)}')"
        >
          View all ${comments} comments
        </button>

        ${
          created
            ? `<small>${formatDate(created)}</small>`
            : ""
        }

      </div>

    </article>
  `;
}


/* =========================================================
   CREATE POST
   ========================================================= */

function showCreate() {
  $("createBox")?.classList.remove("hidden");

  setTimeout(() => {
    $("postText")?.focus();
  }, 100);
}

function hideCreate() {
  $("createBox")?.classList.add("hidden");

  if ($("postText")) {
    $("postText").value = "";
  }
}

async function createPost() {
  const text = $("postText")?.value.trim();

  if (!text) {
    showMessage("Post me kuch likho.");
    return;
  }

  try {
    const data = await apiFetch(`${API}/posts`, {
      method: "POST",
      body: JSON.stringify({
        text
      })
    });

    hideCreate();

    showMessage(
      data.message || "Post successfully create ho gaya."
    );

    await loadPosts();

  } catch (error) {
    showMessage(error.message);
  }
}


/* =========================================================
   LIKE
   ========================================================= */

async function likePost(postId) {
  if (!postId) return;

  try {
    await apiFetch(
      `${API}/posts/${encodeURIComponent(postId)}/like`,
      {
        method: "POST"
      }
    );

    await loadPosts();

  } catch (error) {
    showMessage(error.message);
  }
}


/* =========================================================
   COMMENTS
   ========================================================= */

async function showComments(postId) {
  currentPostId = postId;

  $("commentBox")?.classList.remove("hidden");

  const list = $("commentList");

  if (!list) return;

  list.innerHTML = `
    <div class="loading">
      Loading comments...
    </div>
  `;

  try {
    const data = await apiFetch(
      `${API}/posts/${encodeURIComponent(postId)}/comments`
    );

    let comments = [];

    if (Array.isArray(data)) {
      comments = data;
    } else if (Array.isArray(data.comments)) {
      comments = data.comments;
    } else if (Array.isArray(data.data)) {
      comments = data.data;
    }

    if (!comments.length) {
      list.innerHTML = `
        <p class="empty-state">
          No comments yet.
        </p>
      `;
      return;
    }

    list.innerHTML = comments
      .map(comment => {

        const username =
          comment.username ||
          comment.user?.username ||
          "User";

        const text =
          comment.comment ||
          comment.text ||
          comment.content ||
          "";

        return `
          <div class="comment-item">

            <strong>
              ${escapeHTML(username)}
            </strong>

            <span>
              ${escapeHTML(text)}
            </span>

          </div>
        `;
      })
      .join("");

  } catch (error) {
    list.innerHTML = `
      <div class="error-box">
        ${escapeHTML(error.message)}
      </div>
    `;
  }
}

function hideComments() {
  $("commentBox")?.classList.add("hidden");

  currentPostId = null;

  if ($("commentInput")) {
    $("commentInput").value = "";
  }
}

async function submitComment() {
  const input = $("commentInput");

  if (!input || !currentPostId) return;

  const comment = input.value.trim();

  if (!comment) {
    showMessage("Comment likho.");
    return;
  }

  try {
    await apiFetch(
      `${API}/posts/${encodeURIComponent(currentPostId)}/comment`,
      {
        method: "POST",
        body: JSON.stringify({
          comment
        })
      }
    );

    input.value = "";

    await showComments(currentPostId);

  } catch (error) {
    showMessage(error.message);
  }
}


/* =========================================================
   SEARCH
   ========================================================= */

function showSearch() {
  hideAllSections();

  $("searchSection")?.classList.remove("hidden");

  showBottomNav();

  setTimeout(() => {
    $("searchInput")?.focus();
  }, 100);
}

let searchTimer = null;

async function searchUsers() {
  const input = $("searchInput");

  if (!input) return;

  const query = input.value.trim();

  const results = $("searchResults");

  if (!results) return;

  clearTimeout(searchTimer);

  if (!query) {
    results.innerHTML = "";
    return;
  }

  searchTimer = setTimeout(async () => {

    results.innerHTML = `
      <div class="loading">
        Searching...
      </div>
    `;

    try {

      const data = await apiFetch(
        `${API}/users/search?q=${encodeURIComponent(query)}`
      );

      let users = [];

      if (Array.isArray(data)) {
        users = data;
      } else if (Array.isArray(data.users)) {
        users = data.users;
      } else if (Array.isArray(data.results)) {
        users = data.results;
      }

      if (!users.length) {
        results.innerHTML = `
          <div class="empty-state">
            No users found.
          </div>
        `;
        return;
      }

      results.innerHTML = users
        .map(user => {

          const username =
            user.username ||
            user.name ||
            "";

          return `
            <button
              class="search-user"
              onclick="loadProfile('${escapeHTML(username)}')"
            >

              <span class="avatar">
                ${escapeHTML(
                  username.charAt(0).toUpperCase()
                )}
              </span>

              <strong>
                ${escapeHTML(username)}
              </strong>

            </button>
          `;
        })
        .join("");

    } catch (error) {

      results.innerHTML = `
        <div class="error-box">
          ${escapeHTML(error.message)}
        </div>
      `;

    }

  }, 300);
}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadProfile(username) {
  if (!username) return;

  currentProfileUsername = username;

  hideAllSections();

  $("profileSection")?.classList.remove("hidden");

  showBottomNav();

  const content = $("profileContent");

  if (!content) return;

  content.innerHTML = `
    <div class="loading">
      Loading profile...
    </div>
  `;

  try {

    const data = await apiFetch(
      `${API}/users/${encodeURIComponent(username)}`
    );

    const user =
      data.user ||
      data.profile ||
      data;

    const profileUsername =
      user.username ||
      username;

    const followers =
      user.followersCount ??
      user.followers?.length ??
      0;

    const following =
      user.followingCount ??
      user.following?.length ??
      0;

    const posts =
      user.postsCount ??
      user.postCount ??
      0;

    const isFollowing =
      user.isFollowing ||
      data.isFollowing ||
      false;

    const avatar =
      profileUsername.charAt(0).toUpperCase();

    content.innerHTML = `

      <div class="profile-header">

        <div class="profile-avatar">
          ${escapeHTML(avatar)}
        </div>

        <div class="profile-info">

          <h2>
            ${escapeHTML(profileUsername)}
          </h2>

          <div class="profile-stats">

            <div>
              <strong>${posts}</strong>
              <span>Posts</span>
            </div>

            <button
              onclick="loadProfileUsers('${escapeHTML(profileUsername)}', 'followers')"
            >
              <strong>${followers}</strong>
              <span>Followers</span>
            </button>

            <button
              onclick="loadProfileUsers('${escapeHTML(profileUsername)}', 'following')"
            >
              <strong>${following}</strong>
              <span>Following</span>
            </button>

          </div>

          ${
            currentUser &&
            currentUser !== profileUsername
              ? `
                <button
                  class="primary-btn"
                  onclick="toggleFollow('${escapeHTML(profileUsername)}', ${isFollowing})"
                >
                  ${isFollowing ? "Following" : "Follow"}
                </button>
              `
              : ""
          }

        </div>

      </div>

      <div class="profile-posts">

        ${
          Array.isArray(user.posts) && user.posts.length
            ? user.posts
                .map(post => renderPost(post))
                .join("")
            : `
              <div class="empty-state">
                No posts yet.
              </div>
            `
        }

      </div>
    `;

  } catch (error) {

    content.innerHTML = `
      <div class="error-box">
        ${escapeHTML(error.message)}
      </div>
    `;

  }
}


/* =========================================================
   FOLLOW
   ========================================================= */

async function toggleFollow(username, currentlyFollowing) {

  try {

    const data = await apiFetch(
      `${API}/users/${encodeURIComponent(username)}/follow`,
      {
        method: "POST",
        body: JSON.stringify({
          follow: !currentlyFollowing
        })
      }
    );

    showMessage(
      data.message ||
      (
        currentlyFollowing
          ? "Unfollowed"
          : "Following"
      )
    );

    await loadProfile(username);

  } catch (error) {
    showMessage(error.message);
  }
}


/* =========================================================
   FOLLOWERS / FOLLOWING
   ========================================================= */

async function loadProfileUsers(username, type) {

  currentProfileUsername = username;

  hideAllSections();

  $("profileUsersSection")?.classList.remove("hidden");

  showBottomNav();

  const title = $("profileUsersTitle");
  const list = $("profileUsersList");

  if (title) {
    title.textContent =
      type === "followers"
        ? "Followers"
        : "Following";
  }

  if (!list) return;

  list.innerHTML = `
    <div class="loading">
      Loading...
    </div>
  `;

  try {

    const data = await apiFetch(
      `${API}/users/${encodeURIComponent(username)}/${type}`
    );

    let users = [];

    if (Array.isArray(data)) {
      users = data;
    } else if (Array.isArray(data.users)) {
      users = data.users;
    } else if (Array.isArray(data[type])) {
      users = data[type];
    }

    if (!users.length) {
      list.innerHTML = `
        <div class="empty-state">
          No ${type} yet.
        </div>
      `;
      return;
    }

    list.innerHTML = users
      .map(user => {

        const name =
          user.username ||
          user.name ||
          "";

        return `
          <button
            class="search-user"
            onclick="loadProfile('${escapeHTML(name)}')"
          >

            <span class="avatar">
              ${escapeHTML(
                name.charAt(0).toUpperCase()
              )}
            </span>

            <strong>
              ${escapeHTML(name)}
            </strong>

          </button>
        `;
      })
      .join("");

  } catch (error) {

    list.innerHTML = `
      <div class="error-box">
        ${escapeHTML(error.message)}
      </div>
    `;

  }
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

async function showNotifications() {

  hideAllSections();

  $("notificationsSection")?.classList.remove("hidden");

  showBottomNav();

  const list = $("notificationsList");

  if (!list) return;

  list.innerHTML = `
    <div class="loading">
      Loading notifications...
    </div>
  `;

  try {

    const data = await apiFetch(
      `${API}/notifications`
    );

    let notifications = [];

    if (Array.isArray(data)) {
      notifications = data;
    } else if (Array.isArray(data.notifications)) {
      notifications = data.notifications;
    }

    if (!notifications.length) {
      list.innerHTML = `
        <div class="empty-state">
          <h3>No notifications</h3>
          <p>You're all caught up.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = notifications
      .map(notification => {

        const text =
          notification.message ||
          notification.text ||
          "New notification";

        return `
          <div class="notification-item">
            ${escapeHTML(text)}
          </div>
        `;

      })
      .join("");

  } catch (error) {

    list.innerHTML = `
      <div class="empty-state">
        <h3>No notifications</h3>
        <p>Notifications will appear here.</p>
      </div>
    `;

  }
}


/* =========================================================
   MESSAGES
   ========================================================= */

async function showMessages() {

  hideAllSections();

  $("messagesSection")?.classList.remove("hidden");

  showBottomNav();

  $("chatBox")?.classList.add("hidden");

  const usersContainer = $("messageUsers");

  if (!usersContainer) return;

  usersContainer.innerHTML = `
    <div class="loading">
      Loading conversations...
    </div>
  `;

  try {

    const data = await apiFetch(
      `${API}/messages/users`
    );

    let users = [];

    if (Array.isArray(data)) {
      users = data;
    } else if (Array.isArray(data.users)) {
      users = data.users;
    }

    if (!users.length) {

      usersContainer.innerHTML = `
        <div class="empty-state">
          <h3>Messages</h3>
          <p>Start a conversation with someone.</p>
        </div>
      `;

      return;
    }

    usersContainer.innerHTML = users
      .map(user => {

        const username =
          user.username ||
          user.name ||
          "";

        return `
          <button
            class="search-user"
            onclick="openChat('${escapeHTML(username)}')"
          >

            <span class="avatar">
              ${escapeHTML(
                username.charAt(0).toUpperCase()
              )}
            </span>

            <strong>
              ${escapeHTML(username)}
            </strong>

          </button>
        `;
      })
      .join("");

  } catch (error) {

    usersContainer.innerHTML = `
      <div class="empty-state">
        <h3>Messages</h3>
        <p>Messaging is ready for backend integration.</p>
      </div>
    `;

  }
}


async function openChat(username) {

  currentChatUsername = username;

  $("messageUsers")?.classList.add("hidden");
  $("chatBox")?.classList.remove("hidden");

  if ($("chatUsername")) {
    $("chatUsername").textContent = username;
  }

  await loadMessages(username);
}


async function loadMessages(username) {

  const list = $("messagesList");

  if (!list) return;

  list.innerHTML = `
    <div class="loading">
      Loading messages...
    </div>
  `;

  try {

    const data = await apiFetch(
      `${API}/messages/${encodeURIComponent(username)}`
    );

    let messages = [];

    if (Array.isArray(data)) {
      messages = data;
    } else if (Array.isArray(data.messages)) {
      messages = data.messages;
    }

    if (!messages.length) {
      list.innerHTML = `
        <div class="empty-state">
          No messages yet.
        </div>
      `;
      return;
    }

    list.innerHTML = messages
      .map(message => {

        const sender =
          message.sender ||
          message.from ||
          message.username ||
          "";

        const text =
          message.text ||
          message.message ||
          "";

        const mine =
          sender === currentUser;

        return `
          <div class="message ${
            mine ? "message-mine" : "message-other"
          }">

            ${escapeHTML(text)}

          </div>
        `;

      })
      .join("");

    list.scrollTop = list.scrollHeight;

  } catch (error) {

    list.innerHTML = `
      <div class="empty-state">
        No messages yet.
      </div>
    `;

  }
}


async function sendMessage() {

  const input = $("messageInput");

  if (!input || !currentChatUsername) return;

  const text = input.value.trim();

  if (!text) return;

  try {

    await apiFetch(
      `${API}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          to: currentChatUsername,
          message: text,
          text
        })
      }
    );

    input.value = "";

    await loadMessages(currentChatUsername);

  } catch (error) {

    showMessage(error.message);

  }
}


/* =========================================================
   SHARE
   ========================================================= */

async function sharePost(postId) {

  const url =
    `${window.location.origin}/?post=${encodeURIComponent(postId)}`;

  if (navigator.share) {

    try {

      await navigator.share({
        title: "LuckySocial",
        text: "Check this post on LuckySocial",
        url
      });

    } catch {
      // User cancelled share.
    }

  } else {

    try {

      await navigator.clipboard.writeText(url);

      showMessage("Post link copied.");

    } catch {

      showMessage(url);

    }

  }
}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(dateValue) {

  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const diff =
    Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

  if (diff < 60) {
    return "just now";
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h`;
  }

  if (diff < 604800) {
    return `${Math.floor(diff / 86400)}d`;
  }

  return date.toLocaleDateString();
}


/* =========================================================
   KEYBOARD EVENTS
   ========================================================= */

document.addEventListener("keydown", event => {

  if (
    event.key === "Escape"
  ) {

    hideCreate();
    hideComments();
    hideLogout();

  }

  if (
    event.key === "Enter" &&
    document.activeElement?.id === "commentInput"
  ) {

    event.preventDefault();

    submitComment();

  }

  if (
    event.key === "Enter" &&
    document.activeElement?.id === "messageInput"
  ) {

    event.preventDefault();

    sendMessage();

  }

});


/* =========================================================
   APP START
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const token =
    localStorage.getItem("luckysocial_token");

  const savedUser =
    localStorage.getItem("luckysocial_user");

  if (token && savedUser) {

    currentUser = savedUser;

    try {

      const data = await apiFetch(
        `${API}/me`
      );

      if (data.user?.username) {
        currentUser = data.user.username;

        localStorage.setItem(
          "luckysocial_user",
          currentUser
        );
      }

      await loadPosts();

    } catch (error) {

      localStorage.removeItem(
        "luckysocial_token"
      );

      localStorage.removeItem(
        "luckysocial_user"
      );

      currentUser = null;

      hideAllSections();
      hideBottomNav();

      $("loginSection")?.classList.remove("hidden");

    }

  } else {

    hideAllSections();
    hideBottomNav();

    $("loginSection")?.classList.remove("hidden");

  }

});
