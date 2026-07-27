import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCO1u1_hGSSrRZg1EVlbmXNHzAgdepbHm4",
  authDomain: "butterfly-amy.firebaseapp.com",
  projectId: "butterfly-amy",
  storageBucket: "butterfly-amy.firebasestorage.app",
  messagingSenderId: "137885598223",
  appId: "1:137885598223:web:4ab355dad5bf2bba6b197a"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});

const form = document.querySelector("#guestbookForm");
const nameInput = document.querySelector("#guestbookName");
const messageInput = document.querySelector("#guestbookMessage");
const statusMessage = document.querySelector("#guestbookStatus");
const commentsContainer = document.querySelector("#guestbookComments");
const submitButton = document.querySelector("#guestbookSubmit");

const ownerLoginButton =
  document.querySelector("#ownerLoginButton");

const ownerLoginStatus =
  document.querySelector("#ownerLoginStatus");

function escapeHTML(value = "") {
  const div = document.createElement("div");

  div.textContent = String(value);

  return div.innerHTML;
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp.toDate());
}

function setStatus(message, type = "") {
  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;

  if (type) {
    statusMessage.dataset.type = type;
  } else {
    delete statusMessage.dataset.type;
  }
}

function setSubmitLoading(isLoading) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isLoading;

  submitButton.textContent = isLoading
    ? "Sending..."
    : "Leave a message";
}

function renderEmptyState() {
  if (!commentsContainer) {
    return;
  }

  commentsContainer.innerHTML = `
    <div class="guestbook-empty">
      <span aria-hidden="true">✦</span>

      <p>
        Be the first person to leave a message! 🦋
      </p>
    </div>
  `;
}

function renderErrorState() {
  if (!commentsContainer) {
    return;
  }

  commentsContainer.innerHTML = `
    <p class="guestbook-error">
      The messages could not be loaded right now.
    </p>
  `;
}

function renderComments(snapshot) {
  if (!commentsContainer) {
    return;
  }

  if (snapshot.empty) {
    renderEmptyState();

    return;
  }

  commentsContainer.innerHTML = snapshot.docs
    .map((documentSnapshot) => {
      const comment = documentSnapshot.data();

      return `
        <article
          class="guestbook-comment"
          data-comment-id="${escapeHTML(documentSnapshot.id)}"
        >

          <div class="guestbook-comment-header">

            <div
              class="guestbook-avatar"
              aria-hidden="true"
            >
              ✦
            </div>

            <div class="guestbook-comment-meta">

              <h3>
                ${escapeHTML(comment.name || "Guest")}
              </h3>

              <time>
                ${formatDate(comment.createdAt)}
              </time>

            </div>

          </div>

          <p>
            ${escapeHTML(comment.message || "").replace(/\n/g, "<br>")}
          </p>

        </article>
      `;
    })
    .join("");
}

const commentsQuery = query(
  collection(db, "guestbookMessages"),
  orderBy("createdAt", "desc")
);

onSnapshot(
  commentsQuery,

  (snapshot) => {
    renderComments(snapshot);
  },

  (error) => {
    console.error(
      "Could not load guestbook messages:",
      error
    );

    renderErrorState();
  }
);

form?.addEventListener(
  "submit",

  async (event) => {
    event.preventDefault();

    const name =
      nameInput?.value.trim() || "";

    const message =
      messageInput?.value.trim() || "";

    if (!name || !message) {
      setStatus(
        "Please enter both a nickname and a message.",
        "error"
      );

      return;
    }

    if (name.length > 30) {
      setStatus(
        "Your nickname can contain a maximum of 30 characters.",
        "error"
      );

      return;
    }

    if (message.length > 500) {
      setStatus(
        "Your message can contain a maximum of 500 characters.",
        "error"
      );

      return;
    }

    setSubmitLoading(true);

    setStatus("");

    try {
      await addDoc(
        collection(db, "guestbookMessages"),

        {
          name,
          message,
          createdAt: serverTimestamp()
        }
      );

      form.reset();

      setStatus(
        "Message sent! ✨",
        "success"
      );
    } catch (error) {
      console.error(
        "Could not post guestbook message:",
        error
      );

      setStatus(
        "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  }
);

ownerLoginButton?.addEventListener(
  "click",

  async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);

        return;
      }

      await signInWithPopup(
        auth,
        googleProvider
      );
    } catch (error) {
      console.error(
        "Owner login failed:",
        error
      );

      if (ownerLoginStatus) {
        ownerLoginStatus.textContent =
          "Login failed. Please try again.";
      }
    }
  }
);

onAuthStateChanged(
  auth,

  (user) => {
    if (!ownerLoginButton || !ownerLoginStatus) {
      if (user) {
        console.log(
          "OWNER UID:",
          user.uid
        );
      }

      return;
    }

    if (user) {
      ownerLoginStatus.textContent =
        `Logged in as ${user.displayName || user.email}`;

      ownerLoginButton.textContent =
        "Log out";

      ownerLoginButton.classList.add(
        "is-logged-in"
      );

      console.log(
        "OWNER UID:",
        user.uid
      );
    } else {
      ownerLoginStatus.textContent =
        "Not logged in";

      ownerLoginButton.textContent =
        "Owner login";

      ownerLoginButton.classList.remove(
        "is-logged-in"
      );
    }
  }
);
