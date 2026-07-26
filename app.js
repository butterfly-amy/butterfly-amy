/* =========================================================
   AMY'S UNIVERSE
   Main JavaScript
========================================================= */

"use strict";


/* =========================================================
   1. ELEMENTS
========================================================= */

const mobileMenuButton = document.getElementById("mobileMenuButton");
const navigationList = document.getElementById("navigationList");
const navigationLinks = document.querySelectorAll(".navigation-link");

const cursorGlow = document.getElementById("cursorGlow");
const cursorParticles = document.getElementById("cursorParticles");

const constellationMap = document.getElementById("constellationMap");
const constellationStars = document.querySelectorAll(".constellation-star");
const constellationLines = document.querySelector(".constellation-lines");

const interestInformation = document.getElementById("interestInformation");
const interestTitle = document.getElementById("interestTitle");
const interestDescription = document.getElementById("interestDescription");

const interestModal = document.getElementById("interestModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalCloseElements = document.querySelectorAll("[data-close-modal]");

const backgroundMusic = document.getElementById("backgroundMusic");
const playPauseButton = document.getElementById("playPauseButton");
const previousTrackButton = document.getElementById("previousTrackButton");
const nextTrackButton = document.getElementById("nextTrackButton");
const musicTitle = document.getElementById("musicTitle");

const currentYear = document.getElementById("currentYear");


/* =========================================================
   2. INTEREST INFORMATION
========================================================= */

const interestData = {
  coding: {
    title: "Coding",
    shortDescription:
      "Coding lets me turn ideas into websites, games and interactive worlds.",
    fullDescription:
      "Coding feels like a form of creation. I can begin with an empty file and slowly build something people can see, explore and interact with. I especially enjoy websites, JavaScript, game systems and projects that feel like entire worlds."
  },

  stories: {
    title: "Stories",
    shortDescription:
      "Stories allow me to create people, places and systems that do not exist yet.",
    fullDescription:
      "I love stories with deep characters, mysteries, emotional relationships, hidden rules and worlds that feel larger than the main plot. I also enjoy creating my own stories, including webtoon ideas and darker fantasy concepts."
  },

  art: {
    title: "Art",
    shortDescription:
      "Art helps me give a visible form to ideas that previously existed only in my mind.",
    fullDescription:
      "I enjoy drawing characters, collecting visual inspiration, designing aesthetics and imagining how fictional worlds should look. Art is one of the ways I turn imagination into something real."
  },

  psychology: {
    title: "Psychology",
    shortDescription:
      "I find emotions, behaviour and personality deeply interesting.",
    fullDescription:
      "Psychology helps me understand why people behave the way they do. I enjoy analysing personalities, fears, motivations, relationships, jealousy, anger, attachment and the hidden reasons behind people's choices."
  },

  philosophy: {
    title: "Philosophy",
    shortDescription:
      "I like questions about identity, morality, freedom and what makes a life meaningful.",
    fullDescription:
      "Philosophy interests me because there are often no simple answers. I enjoy thinking about morality, human nature, justice, freedom, destiny and whether people are shaped more by their choices or their circumstances."
  },

  languages: {
    title: "Languages",
    shortDescription:
      "Languages open doors into different cultures, stories and ways of thinking.",
    fullDescription:
      "I enjoy learning languages and noticing how differently ideas can be expressed. Languages also help me communicate with more people and understand stories in a deeper way."
  },

  games: {
    title: "Games",
    shortDescription:
      "Games combine worlds, systems, music, art and interaction.",
    fullDescription:
      "I enjoy games because they allow people to enter a world instead of only reading about it. I also love thinking about game mechanics, progression systems, character abilities and how to make a game feel satisfying."
  },

  books: {
    title: "Books",
    shortDescription:
      "Books are doorways into characters and worlds that can stay with you for years.",
    fullDescription:
      "I especially enjoy fantasy, mystery, danmei and character-driven stories. I love books with complicated relationships, memorable characters, powerful emotional scenes and detailed world-building."
  }
};


/* =========================================================
   3. MUSIC PLAYLIST
========================================================= */

const playlist = [
  {
    title: "Music of the Universe",
    source: "audio/universe-theme.mp3"
  },

  {
    title: "Beyond the Stars",
    source: "audio/beyond-the-stars.mp3"
  },

  {
    title: "Butterflies in Time",
    source: "audio/butterflies-in-time.mp3"
  }
];

let currentTrackIndex = 0;


/* =========================================================
   4. MOBILE NAVIGATION
========================================================= */

function toggleMobileMenu() {
  if (!navigationList || !mobileMenuButton) {
    return;
  }

  const menuIsOpen = navigationList.classList.toggle("open");

  mobileMenuButton.setAttribute(
    "aria-expanded",
    String(menuIsOpen)
  );

  mobileMenuButton.setAttribute(
    "aria-label",
    menuIsOpen ? "Close navigation" : "Open navigation"
  );
}


function closeMobileMenu() {
  if (!navigationList || !mobileMenuButton) {
    return;
  }

  navigationList.classList.remove("open");
  mobileMenuButton.setAttribute("aria-expanded", "false");
  mobileMenuButton.setAttribute("aria-label", "Open navigation");
}


if (mobileMenuButton) {
  mobileMenuButton.addEventListener("click", toggleMobileMenu);
}


navigationLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});


document.addEventListener("click", (event) => {
  if (!navigationList || !mobileMenuButton) {
    return;
  }

  const clickedInsideMenu = navigationList.contains(event.target);
  const clickedMenuButton = mobileMenuButton.contains(event.target);

  if (!clickedInsideMenu && !clickedMenuButton) {
    closeMobileMenu();
  }
});


window.addEventListener("resize", () => {
  if (window.innerWidth > 820) {
    closeMobileMenu();
  }
});


/* =========================================================
   5. ACTIVE NAVIGATION LINK
========================================================= */

const pageSections = document.querySelectorAll("main section[id]");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const activeSectionId = entry.target.id;

      navigationLinks.forEach((link) => {
        const linkTarget = link.getAttribute("href");

        link.classList.toggle(
          "active",
          linkTarget === `#${activeSectionId}`
        );
      });
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0
  }
);


pageSections.forEach((section) => {
  sectionObserver.observe(section);
});


/* =========================================================
   6. CURSOR GLOW
========================================================= */

let cursorX = 0;
let cursorY = 0;
let glowX = 0;
let glowY = 0;

const pointerIsFine = window.matchMedia("(pointer: fine)").matches;


if (pointerIsFine && cursorGlow) {
  document.addEventListener("mousemove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;

    cursorGlow.style.opacity = "1";
  });

  document.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursorGlow.style.opacity = "1";
  });


  function animateCursorGlow() {
    glowX += (cursorX - glowX) * 0.12;
    glowY += (cursorY - glowY) * 0.12;

    cursorGlow.style.transform =
      `translate(${glowX - 105}px, ${glowY - 105}px)`;

    window.requestAnimationFrame(animateCursorGlow);
  }

  animateCursorGlow();
}


/* =========================================================
   7. CURSOR PARTICLES
========================================================= */

let lastParticleTime = 0;


function createCursorParticle(x, y) {
  if (!cursorParticles) {
    return;
  }

  const particle = document.createElement("span");

  const symbols = ["✦", "✧", "⋆", "·"];
  const selectedSymbol =
    symbols[Math.floor(Math.random() * symbols.length)];

  particle.textContent = selectedSymbol;

  particle.style.position = "fixed";
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.zIndex = "9998";
  particle.style.pointerEvents = "none";
  particle.style.color = "rgba(199, 168, 255, 0.9)";
  particle.style.fontSize = `${8 + Math.random() * 8}px`;
  particle.style.textShadow =
    "0 0 8px rgba(143, 184, 255, 0.85)";
  particle.style.transform = "translate(-50%, -50%)";
  particle.style.transition =
    "opacity 700ms ease, transform 700ms ease";

  cursorParticles.appendChild(particle);

  window.requestAnimationFrame(() => {
    particle.style.opacity = "0";
    particle.style.transform =
      `translate(
        calc(-50% + ${(Math.random() - 0.5) * 40}px),
        calc(-50% + ${20 + Math.random() * 35}px)
      ) scale(0.2) rotate(${Math.random() * 180}deg)`;
  });

  window.setTimeout(() => {
    particle.remove();
  }, 750);
}


if (pointerIsFine) {
  document.addEventListener("mousemove", (event) => {
    const currentTime = Date.now();

    if (currentTime - lastParticleTime < 55) {
      return;
    }

    lastParticleTime = currentTime;

    createCursorParticle(event.clientX, event.clientY);
  });
}


/* =========================================================
   8. CONSTELLATION LINES
========================================================= */

function drawConstellationLines() {
  if (
    !constellationMap ||
    !constellationLines ||
    constellationStars.length < 2
  ) {
    return;
  }

  const mapRectangle = constellationMap.getBoundingClientRect();

  constellationLines.innerHTML = "";

  constellationLines.setAttribute(
    "viewBox",
    `0 0 ${mapRectangle.width} ${mapRectangle.height}`
  );

  const starPositions = Array.from(constellationStars).map((star) => {
    const rectangle = star.getBoundingClientRect();

    return {
      x:
        rectangle.left -
        mapRectangle.left +
        rectangle.width / 2,

      y:
        rectangle.top -
        mapRectangle.top +
        rectangle.height / 2
    };
  });

  const connections = [
    [0, 1],
    [1, 2],
    [0, 3],
    [1, 3],
    [1, 5],
    [3, 4],
    [4, 5],
    [3, 6],
    [4, 6],
    [4, 7],
    [5, 7]
  ];

  connections.forEach(([startIndex, endIndex]) => {
    const start = starPositions[startIndex];
    const end = starPositions[endIndex];

    if (!start || !end) {
      return;
    }

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);

    line.setAttribute(
      "stroke",
      "rgba(199, 168, 255, 0.28)"
    );

    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-dasharray", "4 7");

    constellationLines.appendChild(line);
  });
}


window.addEventListener("load", drawConstellationLines);
window.addEventListener("resize", drawConstellationLines);


/* =========================================================
   9. CONSTELLATION INTERACTION
========================================================= */

function selectInterest(star) {
  const interestKey = star.dataset.interest;
  const selectedInterest = interestData[interestKey];

  if (!selectedInterest) {
    return;
  }

  constellationStars.forEach((otherStar) => {
    otherStar.classList.remove("active");
  });

  star.classList.add("active");

  if (interestTitle) {
    interestTitle.textContent = selectedInterest.title;
  }

  if (interestDescription) {
    interestDescription.textContent =
      selectedInterest.shortDescription;
  }

  if (interestInformation) {
    interestInformation.animate(
      [
        {
          opacity: 0.45,
          transform: "translateY(10px)"
        },
        {
          opacity: 1,
          transform: "translateY(0)"
        }
      ],
      {
        duration: 350,
        easing: "ease-out"
      }
    );
  }
}


constellationStars.forEach((star) => {
  star.addEventListener("click", () => {
    selectInterest(star);
  });

  star.addEventListener("dblclick", () => {
    const interestKey = star.dataset.interest;
    openInterestModal(interestKey);
  });
});


/* =========================================================
   10. INTEREST MODAL
========================================================= */

function openInterestModal(interestKey) {
  if (!interestModal) {
    return;
  }

  const selectedInterest = interestData[interestKey];

  if (!selectedInterest) {
    return;
  }

  if (modalTitle) {
    modalTitle.textContent = selectedInterest.title;
  }

  if (modalDescription) {
    modalDescription.textContent =
      selectedInterest.fullDescription;
  }

  interestModal.hidden = false;
  document.body.classList.add("modal-open");

  const closeButton = interestModal.querySelector(
    ".modal-close-button"
  );

  if (closeButton) {
    closeButton.focus();
  }
}


function closeInterestModal() {
  if (!interestModal) {
    return;
  }

  interestModal.hidden = true;
  document.body.classList.remove("modal-open");
}


modalCloseElements.forEach((element) => {
  element.addEventListener("click", closeInterestModal);
});


document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeInterestModal();
    closeMobileMenu();
  }
});


/* =========================================================
   11. MUSIC PLAYER
========================================================= */

function loadTrack(trackIndex) {
  if (!backgroundMusic || playlist.length === 0) {
    return;
  }

  currentTrackIndex =
    (trackIndex + playlist.length) % playlist.length;

  const selectedTrack = playlist[currentTrackIndex];

  backgroundMusic.src = selectedTrack.source;

  if (musicTitle) {
    musicTitle.textContent = selectedTrack.title;
  }
}


async function playMusic() {
  if (!backgroundMusic || !playPauseButton) {
    return;
  }

  try {
    await backgroundMusic.play();

    playPauseButton.textContent = "❚❚";
    playPauseButton.setAttribute("aria-label", "Pause music");
  } catch (error) {
    console.warn(
      "The browser blocked autoplay or the audio file is missing.",
      error
    );
  }
}


function pauseMusic() {
  if (!backgroundMusic || !playPauseButton) {
    return;
  }

  backgroundMusic.pause();

  playPauseButton.textContent = "▶";
  playPauseButton.setAttribute("aria-label", "Play music");
}


function toggleMusic() {
  if (!backgroundMusic) {
    return;
  }

  if (backgroundMusic.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
}


async function changeTrack(direction) {
  if (!backgroundMusic) {
    return;
  }

  const musicWasPlaying = !backgroundMusic.paused;

  loadTrack(currentTrackIndex + direction);

  if (musicWasPlaying) {
    await playMusic();
  }
}


if (playPauseButton) {
  playPauseButton.addEventListener("click", toggleMusic);
}


if (previousTrackButton) {
  previousTrackButton.addEventListener("click", () => {
    changeTrack(-1);
  });
}


if (nextTrackButton) {
  nextTrackButton.addEventListener("click", () => {
    changeTrack(1);
  });
}


if (backgroundMusic) {
  backgroundMusic.addEventListener("ended", () => {
    changeTrack(1);
  });

  backgroundMusic.addEventListener("error", () => {
    if (musicTitle) {
      musicTitle.textContent = "Add your music files later";
    }

    pauseMusic();
  });
}


/* =========================================================
   12. REVEAL ELEMENTS WHILE SCROLLING
========================================================= */

const revealElements = document.querySelectorAll(
  [
    ".section-heading",
    ".about-card",
    ".information-card",
    ".quote-card",
    ".world-card",
    ".constellation-map",
    ".interest-information",
    ".timeline-item",
    ".project-card",
    ".portal-clock",
    ".portal-content"
  ].join(",")
);


revealElements.forEach((element) => {
  element.style.opacity = "0";
  element.style.transform = "translateY(35px)";
  element.style.transition =
    "opacity 700ms ease, transform 700ms ease";
});


const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";

      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -70px 0px"
  }
);


revealElements.forEach((element) => {
  revealObserver.observe(element);
});


/* =========================================================
   13. WORLD CARD TILT
========================================================= */

const worldCards = document.querySelectorAll(".world-card");
const projectCards = document.querySelectorAll(".project-card");

const tiltingCards = [...worldCards, ...projectCards];


if (pointerIsFine) {
  tiltingCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rectangle = card.getBoundingClientRect();

      const horizontalPosition =
        (event.clientX - rectangle.left) / rectangle.width;

      const verticalPosition =
        (event.clientY - rectangle.top) / rectangle.height;

      const rotateY = (horizontalPosition - 0.5) * 5;
      const rotateX = (0.5 - verticalPosition) * 5;

      card.style.transform =
        `perspective(900px)
         rotateX(${rotateX}deg)
         rotateY(${rotateY}deg)
         translateY(-8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}


/* =========================================================
   14. RANDOM SHOOTING STAR
========================================================= */

function createShootingStar() {
  const shootingStar = document.createElement("span");

  shootingStar.style.position = "fixed";
  shootingStar.style.zIndex = "-1";
  shootingStar.style.top = `${Math.random() * 55}%`;
  shootingStar.style.left = `${55 + Math.random() * 40}%`;
  shootingStar.style.width = `${90 + Math.random() * 130}px`;
  shootingStar.style.height = "1px";
  shootingStar.style.pointerEvents = "none";
  shootingStar.style.opacity = "0";

  shootingStar.style.background =
    "linear-gradient(90deg, transparent, rgba(255,255,255,0.95))";

  shootingStar.style.filter =
    "drop-shadow(0 0 7px rgba(255,255,255,0.9))";

  shootingStar.style.transform = "rotate(-35deg)";

  shootingStar.style.transition =
    "transform 1100ms linear, opacity 250ms ease";

  document.body.appendChild(shootingStar);

  window.requestAnimationFrame(() => {
    shootingStar.style.opacity = "1";

    shootingStar.style.transform =
      "translate(-600px, 400px) rotate(-35deg)";
  });

  window.setTimeout(() => {
    shootingStar.style.opacity = "0";
  }, 850);

  window.setTimeout(() => {
    shootingStar.remove();
  }, 1300);
}


function scheduleShootingStar() {
  const delay = 5000 + Math.random() * 9000;

  window.setTimeout(() => {
    createShootingStar();
    scheduleShootingStar();
  }, delay);
}


scheduleShootingStar();


/* =========================================================
   15. FLOATING BUTTERFLIES
========================================================= */

function createButterfly() {
  const butterfly = document.createElement("span");

  butterfly.textContent = "🦋";

  butterfly.style.position = "fixed";
  butterfly.style.zIndex = "3";
  butterfly.style.left = "-60px";
  butterfly.style.top = `${15 + Math.random() * 70}%`;
  butterfly.style.pointerEvents = "none";
  butterfly.style.fontSize = `${18 + Math.random() * 18}px`;
  butterfly.style.opacity = `${0.28 + Math.random() * 0.35}`;
  butterfly.style.filter =
    "drop-shadow(0 0 10px rgba(199,168,255,0.55))";

  document.body.appendChild(butterfly);

  const verticalMovement = (Math.random() - 0.5) * 250;
  const duration = 12000 + Math.random() * 9000;

  const animation = butterfly.animate(
    [
      {
        transform:
          "translate3d(0, 0, 0) rotate(-12deg) scaleX(1)"
      },

      {
        transform:
          `translate3d(35vw, ${verticalMovement * 0.4}px, 0)
           rotate(10deg)
           scaleX(0.65)`
      },

      {
        transform:
          `translate3d(70vw, ${verticalMovement * 0.7}px, 0)
           rotate(-8deg)
           scaleX(1)`
      },

      {
        transform:
          `translate3d(calc(100vw + 120px), ${verticalMovement}px, 0)
           rotate(12deg)
           scaleX(0.7)`
      }
    ],
    {
      duration,
      easing: "ease-in-out"
    }
  );

  animation.addEventListener("finish", () => {
    butterfly.remove();
  });
}


function scheduleButterfly() {
  const delay = 7000 + Math.random() * 11000;

  window.setTimeout(() => {
    createButterfly();
    scheduleButterfly();
  }, delay);
}


scheduleButterfly();


/* =========================================================
   16. SMOOTH INTERNAL LINKS
========================================================= */

const internalLinks = document.querySelectorAll('a[href^="#"]');


internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      event.preventDefault();
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (!targetElement) {
      return;
    }

    event.preventDefault();

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});


/* =========================================================
   17. CURRENT YEAR
========================================================= */

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}


/* =========================================================
   18. INITIAL SETUP
========================================================= */

function initialiseWebsite() {
  loadTrack(0);

  if (constellationStars.length > 0) {
    selectInterest(constellationStars[0]);
  }

  drawConstellationLines();
}


window.addEventListener("load", initialiseWebsite);
