import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
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

const form = document.querySelector("#guestbookForm");
const nameInput = document.querySelector("#guestbookName");
const messageInput = document.querySelector("#guestbookMessage");
const statusMessage = document.querySelector("#guestbookStatus");
const commentsContainer = document.querySelector("#guestbookComments");
const submitButton = document.querySelector("#guestbookSubmit");

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "Just now";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(timestamp.toDate());
}

function renderEmptyState() {
  commentsContainer.innerHTML = `
    <div class="guestbook-empty">
      <span>✦</span>
      <p>Be the first person to leave a message! 🦋</p>
    </div>
  `;
}

function renderComments(snapshot) {
  if (snapshot.empty) {
    renderEmptyState();
    return;
  }

  commentsContainer.innerHTML = "";

  snapshot.forEach((doc) => {
    const comment = doc.data();

    commentsContainer.innerHTML += `
      <article class="guestbook-comment">

        <div class="guestbook-comment-header">

          <div class="guestbook-avatar">
            ✦
          </div>

          <div>

            <h3>${escapeHTML(comment.name)}</h3>

            <time>
              ${formatDate(comment.createdAt)}
            </time>

          </div>

        </div>

        <p>
          ${escapeHTML(comment.message).replace(/\n/g, "<br>")}
        </p>

      </article>
    `;
  });
}

const commentsQuery = query(
  collection(db, "guestbookMessages"),
  orderBy("createdAt", "desc")
);

onSnapshot(
  commentsQuery,
  renderComments,
  (error) => {
    console.error(error);

    commentsContainer.innerHTML = `
      <p class="guestbook-error">
        Couldn't load comments.
      </p>
    `;
  }
);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    statusMessage.textContent =
      "Please enter a nickname and a message.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

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

    statusMessage.textContent =
      "Message sent! ✨";

  } catch (error) {

    console.error(error);

    statusMessage.textContent =
      "Something went wrong.";

  }

  submitButton.disabled = false;
  submitButton.textContent =
    "Leave a message";
});
