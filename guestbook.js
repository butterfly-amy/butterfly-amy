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

const replyModal =
  document.querySelector("#guestbookReplyModal");

const replyModalClose =
  document.querySelector("#replyModalClose");

const replyModalCancel =
  document.querySelector("#replyModalCancel");

const replyModalName =
  document.querySelector("#replyModalName");

const replyForm =
  document.querySelector("#guestbookReplyForm");

const replyNameInput =
  document.querySelector("#guestbookReplyName");

const replyMessageInput =
  document.querySelector("#guestbookReplyMessage");

const replyStatus =
  document.querySelector("#guestbookReplyStatus");

const replySubmitButton =
  document.querySelector("#guestbookReplySubmit");

let activeReplyCommentId = null;


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
            class="guestbook-reply-card${ownerClass}"
            data-reply-id="${escapeHTML(replyDocument.id)}"
          >

            <div class="guestbook-reply-card-top">

              <div
                class="guestbook-reply-avatar"
                aria-hidden="true"
              >
                ${replyIsOwner ? "✧" : "✦"}
              </div>


              <div class="guestbook-reply-card-meta">

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


            <p class="guestbook-reply-card-message">
              ${escapeHTML(
                reply.message || ""
              ).replace(/\n/g, "<br>")}
            </p>

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
   OPEN AND CLOSE REPLY MODAL
===================================================== */

commentsContainer?.addEventListener(
  "click",

  (event) => {
    const replyButton =
      event.target.closest(
        ".guestbook-reply-button"
      );

    if (!replyButton) {
      return;
    }

    const commentId =
      replyButton.dataset.replyTo;

    const commentCard =
      replyButton.closest(
        ".guestbook-comment"
      );

    const commentName =
      commentCard
        ?.querySelector(
          ".guestbook-comment-meta h3"
        )
        ?.textContent
        ?.trim() || "this message";

    openReplyModal(
      commentId,
      commentName
    );
  }
);


function setReplyStatus(
  message,
  type = ""
) {
  if (!replyStatus) {
    return;
  }

  replyStatus.textContent =
    message;

  if (type) {
    replyStatus.dataset.type =
      type;
  } else {
    delete replyStatus.dataset.type;
  }
}


function setReplyLoading(isLoading) {
  if (!replySubmitButton) {
    return;
  }

  replySubmitButton.disabled =
    isLoading;

  replySubmitButton.textContent =
    isLoading
      ? "Sending..."
      : "Send reply";
}


function openReplyModal(
  commentId,
  commentName = "this message"
) {
  if (
    !replyModal ||
    !replyForm
  ) {
    console.error(
      "Reply modal HTML is missing."
    );

    return;
  }

  activeReplyCommentId =
    commentId;

  replyForm.reset();

  const ownerIsLoggedIn =
    isOwnerUser(auth.currentUser);

  if (replyNameInput) {
    replyNameInput.value =
      ownerIsLoggedIn
        ? "Amy"
        : "";
  }

  if (replyModalName) {
    replyModalName.textContent =
      `Replying to ${commentName}`;
  }

  setReplyStatus("");
  setReplyLoading(false);

  replyModal.hidden = false;
  replyModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "guestbook-modal-open"
  );

  window.requestAnimationFrame(() => {
    replyModal.classList.add(
      "is-open"
    );

    if (
      ownerIsLoggedIn &&
      replyMessageInput
    ) {
      replyMessageInput.focus();
    } else {
      replyNameInput?.focus();
    }
  });
}


function closeReplyModal() {
  if (!replyModal) {
    return;
  }

  replyModal.classList.remove(
    "is-open"
  );

  replyModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "guestbook-modal-open"
  );

  window.setTimeout(() => {
    replyModal.hidden = true;
  }, 180);

  activeReplyCommentId = null;

  replyForm?.reset();
  setReplyStatus("");
  setReplyLoading(false);
}


replyModalClose?.addEventListener(
  "click",
  closeReplyModal
);


replyModalCancel?.addEventListener(
  "click",
  closeReplyModal
);


replyModal?.addEventListener(
  "click",

  (event) => {
    if (
      event.target === replyModal
    ) {
      closeReplyModal();
    }
  }
);


document.addEventListener(
  "keydown",

  (event) => {
    if (
      event.key === "Escape" &&
      replyModal &&
      !replyModal.hidden
    ) {
      closeReplyModal();
    }
  }
);


/* =====================================================
   POST REPLY
===================================================== */

replyForm?.addEventListener(
  "submit",

  async (event) => {
    event.preventDefault();

    if (!activeReplyCommentId) {
      setReplyStatus(
        "Please choose a message to reply to.",
        "error"
      );

      return;
    }

    const name =
      replyNameInput?.value.trim() || "";

    const message =
      replyMessageInput?.value.trim() || "";

    if (!name || !message) {
      setReplyStatus(
        "Please enter a nickname and reply.",
        "error"
      );

      return;
    }

    if (name.length > 30) {
      setReplyStatus(
        "Your nickname can contain a maximum of 30 characters.",
        "error"
      );

      return;
    }

    if (message.length > 500) {
      setReplyStatus(
        "Your reply can contain a maximum of 500 characters.",
        "error"
      );

      return;
    }

    setReplyLoading(true);
    setReplyStatus("");

    try {
      const currentUser =
        auth.currentUser;

      const ownerIsReplying =
        isOwnerUser(currentUser);

      await addDoc(
        collection(
          db,
          "guestbookMessages",
          activeReplyCommentId,
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

      closeReplyModal();
    } catch (error) {
      console.error(
        "Could not post reply:",
        error
      );

      setReplyStatus(
        "Something went wrong. Please try again.",
        "error"
      );

      setReplyLoading(false);
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
