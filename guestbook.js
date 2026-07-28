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


/* =====================================================
   FIREBASE
===================================================== */

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


/* =====================================================
   OWNER
===================================================== */

const OWNER_UID =
  "OrGWes13tkXHOH09oIPhvONskyK2";

const OWNER_EMAIL =
  "amina.mukhtarova.2008@gmail.com";


function cleanValue(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}


function isOwnerUser(user) {
  if (!user) {
    return false;
  }

  const uidMatches =
    cleanValue(user.uid) ===
    cleanValue(OWNER_UID);

  const emailMatches =
    cleanValue(user.email).toLowerCase() ===
    cleanValue(OWNER_EMAIL).toLowerCase();

  return uidMatches || emailMatches;
}


function isOwnerContent(data) {
  if (!data) {
    return false;
  }

  const uidMatches =
    cleanValue(data.authorUid) ===
    cleanValue(OWNER_UID);

  const emailMatches =
    cleanValue(data.authorEmail).toLowerCase() ===
    cleanValue(OWNER_EMAIL).toLowerCase();

  return uidMatches || emailMatches;
}


/* =====================================================
   HTML ELEMENTS
===================================================== */

const form =
  document.querySelector("#guestbookForm");

const nameInput =
  document.querySelector("#guestbookName");

const messageInput =
  document.querySelector("#guestbookMessage");

const statusMessage =
  document.querySelector("#guestbookStatus");

const commentsContainer =
  document.querySelector("#guestbookComments");

const submitButton =
  document.querySelector("#guestbookSubmit");

const ownerLoginButton =
  document.querySelector("#ownerLoginButton");

const ownerLoginStatus =
  document.querySelector("#ownerLoginStatus");


/* =====================================================
   REPLY LISTENERS
===================================================== */

const replyUnsubscribers = new Map();


function clearReplyListeners() {
  replyUnsubscribers.forEach((unsubscribe) => {
    unsubscribe();
  });

  replyUnsubscribers.clear();
}


/* =====================================================
   HELPERS
===================================================== */

function escapeHTML(value = "") {
  const div =
    document.createElement("div");

  div.textContent =
    String(value);

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

  statusMessage.textContent =
    message;

  if (type) {
    statusMessage.dataset.type =
      type;
  } else {
    delete statusMessage.dataset.type;
  }
}


function setSubmitLoading(isLoading) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled =
    isLoading;

  submitButton.textContent =
    isLoading
      ? "Sending..."
      : "Leave a message";
}


function createOwnerBadge() {
  return `
    <span
      class="guestbook-op-badge"
      title="Website owner"
    >
      ✦ OP
    </span>
  `;
}


/* =====================================================
   EMPTY AND ERROR STATES
===================================================== */

function renderEmptyState() {
  if (!commentsContainer) {
    return;
  }

  commentsContainer.innerHTML = `
    <div class="guestbook-empty">

      <span aria-hidden="true">
        ✦
      </span>

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


/* =====================================================
   RENDER COMMENTS
===================================================== */

function renderComments(snapshot) {
  if (!commentsContainer) {
    return;
  }

  clearReplyListeners();

  if (snapshot.empty) {
    renderEmptyState();
    return;
  }

  commentsContainer.innerHTML =
    snapshot.docs
      .map((documentSnapshot) => {
        const comment =
          documentSnapshot.data();

        const commentId =
          documentSnapshot.id;

        const commentIsOwner =
          isOwnerContent(comment);

        const ownerBadge =
          commentIsOwner
            ? createOwnerBadge()
            : "";

        const ownerClass =
          commentIsOwner
            ? " guestbook-comment-owner"
            : "";

        return `
          <article
            class="guestbook-comment${ownerClass}"
            data-comment-id="${escapeHTML(commentId)}"
          >

            <div class="guestbook-comment-header">

              <div
                class="guestbook-avatar"
                aria-hidden="true"
              >
                ${commentIsOwner ? "✧" : "✦"}
              </div>


              <div class="guestbook-comment-meta">

                <div class="guestbook-name-row">

                  <h3>
                    ${escapeHTML(
                      comment.name || "Guest"
                    )}
                  </h3>

                  ${ownerBadge}

                </div>


                <time>
                  ${formatDate(comment.createdAt)}
                </time>

              </div>

            </div>


            <p class="guestbook-comment-message">
              ${escapeHTML(
                comment.message || ""
              ).replace(/\n/g, "<br>")}
            </p>


            <div class="guestbook-comment-actions">

              <button
                class="guestbook-reply-button"
                type="button"
                data-reply-to="${escapeHTML(commentId)}"
              >
                💬 Reply
              </button>

            </div>


            <div
              class="guestbook-reply-form-container"
              id="replyFormContainer-${escapeHTML(commentId)}"
              hidden
            >
            </div>


            <div
              class="guestbook-replies"
              id="replies-${escapeHTML(commentId)}"
            >
            </div>

          </article>
        `;
      })
      .join("");

  snapshot.docs.forEach((documentSnapshot) => {
    subscribeToReplies(
      documentSnapshot.id
    );
  });
}


/* =====================================================
   RENDER REPLIES
===================================================== */

function renderReplies(
  commentId,
  snapshot
) {
  const repliesContainer =
    document.getElementById(
      `replies-${commentId}`
    );

  if (!repliesContainer) {
    return;
  }

  if (snapshot.empty) {
    repliesContainer.innerHTML = "";
    return;
  }

  repliesContainer.innerHTML =
    snapshot.docs
      .map((replyDocument) => {
        const reply =
          replyDocument.data();

        const replyIsOwner =
          isOwnerContent(reply);

        const ownerBadge =
          replyIsOwner
            ? createOwnerBadge()
            : "";

        const ownerClass =
          replyIsOwner
            ? " guestbook-reply-owner"
            : "";

        return `
          <article
            class="guestbook-reply${ownerClass}"
            data-reply-id="${escapeHTML(replyDocument.id)}"
          >

            <div class="guestbook-reply-line">
              ↳
            </div>


            <div class="guestbook-reply-content">

              <div class="guestbook-reply-header">

                <div
                  class="guestbook-reply-avatar"
                  aria-hidden="true"
                >
                  ${replyIsOwner ? "✧" : "✦"}
                </div>


                <div>

                  <div class="guestbook-name-row">

                    <h4>
                      ${escapeHTML(
                        reply.name || "Guest"
                      )}
                    </h4>

                    ${ownerBadge}

                  </div>


                  <time>
                    ${formatDate(reply.createdAt)}
                  </time>

                </div>

              </div>


              <p>
                ${escapeHTML(
                  reply.message || ""
                ).replace(/\n/g, "<br>")}
              </p>

            </div>

          </article>
        `;
      })
      .join("");
}


/* =====================================================
   LIVE REPLIES
===================================================== */

function subscribeToReplies(commentId) {
  const repliesQuery = query(
    collection(
      db,
      "guestbookMessages",
      commentId,
      "replies"
    ),
    orderBy("createdAt", "asc")
  );

  const unsubscribe =
    onSnapshot(
      repliesQuery,

      (snapshot) => {
        renderReplies(
          commentId,
          snapshot
        );
      },

      (error) => {
        console.error(
          `Could not load replies for ${commentId}:`,
          error
        );
      }
    );

  replyUnsubscribers.set(
    commentId,
    unsubscribe
  );
}


/* =====================================================
   LIVE COMMENTS
===================================================== */

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


/* =====================================================
   POST MAIN MESSAGE
===================================================== */

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
      const currentUser =
        auth.currentUser;

      const ownerIsPosting =
        isOwnerUser(currentUser);

      await addDoc(
        collection(
          db,
          "guestbookMessages"
        ),

        {
          name,
          message,

          authorUid:
            ownerIsPosting
              ? currentUser.uid
              : null,

          authorEmail:
            ownerIsPosting
              ? currentUser.email
              : null,

          isOwner:
            ownerIsPosting,

          createdAt:
            serverTimestamp()
        }
      );

      form.reset();

      if (
        ownerIsPosting &&
        nameInput
      ) {
        nameInput.value =
          "Amy";
      }

      setStatus(
        ownerIsPosting
          ? "Your OP message was sent! ✨"
          : "Message sent! ✨",
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


/* =====================================================
   OPEN AND CLOSE REPLY FORM
===================================================== */

commentsContainer?.addEventListener(
  "click",

  (event) => {
    const replyButton =
      event.target.closest(
        ".guestbook-reply-button"
      );

    if (replyButton) {
      const commentId =
        replyButton.dataset.replyTo;

      openReplyForm(commentId);

      return;
    }


    const cancelButton =
      event.target.closest(
        ".guestbook-reply-cancel"
      );

    if (cancelButton) {
      const commentId =
        cancelButton.dataset.cancelReply;

      closeReplyForm(commentId);
    }
  }
);


function openReplyForm(commentId) {
  const container =
    document.getElementById(
      `replyFormContainer-${commentId}`
    );

  if (!container) {
    return;
  }

  const ownerIsLoggedIn =
    isOwnerUser(auth.currentUser);

  const defaultName =
    ownerIsLoggedIn
      ? "Amy"
      : "";

  container.innerHTML = `
    <form
      class="guestbook-reply-form"
      data-comment-id="${escapeHTML(commentId)}"
    >

      <p class="small-label">
        Write a reply
      </p>


      <input
        class="guestbook-reply-name"
        type="text"
        maxlength="30"
        placeholder="Your nickname"
        value="${escapeHTML(defaultName)}"
        required
      >


      <textarea
        class="guestbook-reply-message"
        maxlength="500"
        rows="4"
        placeholder="Write your reply..."
        required
      ></textarea>


      <p
        class="guestbook-reply-status"
        aria-live="polite"
      ></p>


      <div class="guestbook-reply-form-actions">

        <button
          class="guestbook-reply-cancel"
          type="button"
          data-cancel-reply="${escapeHTML(commentId)}"
        >
          Cancel
        </button>


        <button
          class="primary-button guestbook-reply-submit"
          type="submit"
        >
          Send reply
        </button>

      </div>

    </form>
  `;

  container.hidden = false;

  const replyTextarea =
    container.querySelector(
      ".guestbook-reply-message"
    );

  replyTextarea?.focus();
}


function closeReplyForm(commentId) {
  const container =
    document.getElementById(
      `replyFormContainer-${commentId}`
    );

  if (!container) {
    return;
  }

  container.hidden = true;
  container.innerHTML = "";
}


/* =====================================================
   POST REPLY
===================================================== */

commentsContainer?.addEventListener(
  "submit",

  async (event) => {
    const replyForm =
      event.target.closest(
        ".guestbook-reply-form"
      );

    if (!replyForm) {
      return;
    }

    event.preventDefault();

    const commentId =
      replyForm.dataset.commentId;

    const replyNameInput =
      replyForm.querySelector(
        ".guestbook-reply-name"
      );

    const replyMessageInput =
      replyForm.querySelector(
        ".guestbook-reply-message"
      );

    const replyStatus =
      replyForm.querySelector(
        ".guestbook-reply-status"
      );

    const replySubmitButton =
      replyForm.querySelector(
        ".guestbook-reply-submit"
      );

    const name =
      replyNameInput?.value.trim() || "";

    const message =
      replyMessageInput?.value.trim() || "";

    if (!name || !message) {
      if (replyStatus) {
        replyStatus.textContent =
          "Please enter a nickname and reply.";
      }

      return;
    }

    if (name.length > 30) {
      if (replyStatus) {
        replyStatus.textContent =
          "Your nickname is too long.";
      }

      return;
    }

    if (message.length > 500) {
      if (replyStatus) {
        replyStatus.textContent =
          "Your reply is too long.";
      }

      return;
    }

    if (replySubmitButton) {
      replySubmitButton.disabled = true;
      replySubmitButton.textContent =
        "Sending...";
    }

    try {
      const currentUser =
        auth.currentUser;

      const ownerIsReplying =
        isOwnerUser(currentUser);

      await addDoc(
        collection(
          db,
          "guestbookMessages",
          commentId,
          "replies"
        ),

        {
          name,
          message,

          authorUid:
            ownerIsReplying
              ? currentUser.uid
              : null,

          authorEmail:
            ownerIsReplying
              ? currentUser.email
              : null,

          isOwner:
            ownerIsReplying,

          createdAt:
            serverTimestamp()
        }
      );

      closeReplyForm(commentId);
    } catch (error) {
      console.error(
        "Could not post reply:",
        error
      );

      if (replyStatus) {
        replyStatus.textContent =
          "Something went wrong. Please try again.";
      }

      if (replySubmitButton) {
        replySubmitButton.disabled = false;
        replySubmitButton.textContent =
          "Send reply";
      }
    }
  }
);


/* =====================================================
   OWNER LOGIN
===================================================== */

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


/* =====================================================
   LOGIN STATE
===================================================== */

onAuthStateChanged(
  auth,

  (user) => {
    const ownerIsLoggedIn =
      isOwnerUser(user);

    if (
      !ownerLoginButton ||
      !ownerLoginStatus
    ) {
      return;
    }


    if (ownerIsLoggedIn) {
      ownerLoginStatus.textContent =
        `Owner logged in as ${
          user.displayName ||
          user.email ||
          "Amy"
        }`;

      ownerLoginButton.textContent =
        "Log out";

      ownerLoginButton.classList.add(
        "is-logged-in"
      );

      document.body.classList.add(
        "guestbook-owner-logged-in"
      );

      if (
        nameInput &&
        !nameInput.value.trim()
      ) {
        nameInput.value =
          "Amy";
      }

      return;
    }


    if (user) {
      ownerLoginStatus.textContent =
        "This Google account is not the owner.";

      ownerLoginButton.textContent =
        "Log out";

      ownerLoginButton.classList.remove(
        "is-logged-in"
      );

      document.body.classList.remove(
        "guestbook-owner-logged-in"
      );

      return;
    }


    ownerLoginStatus.textContent =
      "Not logged in";

    ownerLoginButton.textContent =
      "Owner login";

    ownerLoginButton.classList.remove(
      "is-logged-in"
    );

    document.body.classList.remove(
      "guestbook-owner-logged-in"
    );
  }
);
