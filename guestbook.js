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
   OWNER INFORMATION
===================================================== */

const OWNER_UID = "OrGWes13tkXHOH09oIPhvONskyK2";

const OWNER_EMAIL =
  "amina.mukhtarova.2008@gmail.com";


/*
  Removes spaces and invisible characters that might
  accidentally appear when a value is copied.
*/
function cleanValue(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}


function isOwnerUser(user) {
  if (!user) {
    return false;
  }

  const currentUid =
    cleanValue(user.uid);

  const expectedUid =
    cleanValue(OWNER_UID);

  const currentEmail =
    cleanValue(user.email).toLowerCase();

  const expectedEmail =
    cleanValue(OWNER_EMAIL).toLowerCase();

  const uidMatches =
    currentUid === expectedUid;

  const emailMatches =
    currentEmail === expectedEmail;

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
   HELPERS
===================================================== */

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

  if (snapshot.empty) {
    renderEmptyState();
    return;
  }

  commentsContainer.innerHTML = snapshot.docs
    .map((documentSnapshot) => {
      const comment =
        documentSnapshot.data();

      const commentAuthorUid =
        cleanValue(comment.authorUid);

      const commentAuthorEmail =
        cleanValue(comment.authorEmail)
          .toLowerCase();

      const commentIsOwner =
        commentAuthorUid === cleanValue(OWNER_UID) ||
        commentAuthorEmail ===
          cleanValue(OWNER_EMAIL).toLowerCase();

      const ownerBadge = commentIsOwner
        ? `
          <span
            class="guestbook-op-badge"
            title="Website owner"
          >
            ✦ OP
          </span>
        `
        : "";

      const ownerClass = commentIsOwner
        ? " guestbook-comment-owner"
        : "";

      const avatarSymbol = commentIsOwner
        ? "✧"
        : "✦";

      return `
        <article
          class="guestbook-comment${ownerClass}"
          data-comment-id="${escapeHTML(
            documentSnapshot.id
          )}"
        >

          <div class="guestbook-comment-header">

            <div
              class="guestbook-avatar"
              aria-hidden="true"
            >
              ${avatarSymbol}
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


          <p>
            ${escapeHTML(
              comment.message || ""
            ).replace(/\n/g, "<br>")}
          </p>

        </article>
      `;
    })
    .join("");
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
   POST MESSAGE
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

      const authorUid = ownerIsPosting
        ? cleanValue(currentUser.uid)
        : null;

      const authorEmail = ownerIsPosting
        ? cleanValue(currentUser.email)
            .toLowerCase()
        : null;

      await addDoc(
        collection(
          db,
          "guestbookMessages"
        ),

        {
          name,
          message,
          authorUid,
          authorEmail,
          isOwner: ownerIsPosting,
          createdAt: serverTimestamp()
        }
      );

      form.reset();

      /*
        Put Amy back into the nickname input
        after an owner message is posted.
      */
      if (
        ownerIsPosting &&
        nameInput
      ) {
        nameInput.value = "Amy";
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
   OWNER LOGIN BUTTON
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

    console.log(
      "CURRENT UID:",
      JSON.stringify(user?.uid || null)
    );

    console.log(
      "EXPECTED OWNER UID:",
      JSON.stringify(OWNER_UID)
    );

    console.log(
      "CURRENT EMAIL:",
      user?.email || null
    );

    console.log(
      "IS OWNER:",
      ownerIsLoggedIn
    );

    if (
      !ownerLoginButton ||
      !ownerLoginStatus
    ) {
      return;
    }


    /* Owner is logged in */
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
        nameInput.value = "Amy";
      }

      return;
    }


    /* A different Google account is logged in */
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


    /* Nobody is logged in */
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
