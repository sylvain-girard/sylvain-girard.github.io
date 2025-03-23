// SplitType library initialization
document.querySelectorAll("[data-letter-stagger], [stagger-link-text]").forEach((element) => {
  new SplitType(element, { types: "lines, chars" });
});

// Function to create letter animation
function createLetterAnimation(element) {
  console.log("Creating letter animation for:", element);
  let delay = parseFloat(element.getAttribute("data-delay")) || 0;
  let reverseStagger = element.hasAttribute("data-reverse-stagger");
  let staggerFrom = reverseStagger ? -0.05 : 0.05;
  let rotationZ = reverseStagger ? -40 : 40;

  let charsTimeline = gsap.timeline({
    onStart: () => console.log("Animation started for:", element),
    onComplete: () => console.log("Animation completed for:", element),
  });

  // Set initial values
  gsap.set(element.querySelectorAll(".char"), {
    yPercent: 105,
    rotation: rotationZ,
  });

  // Create the animation
  charsTimeline.fromTo(
    element.querySelectorAll(".char"),
    {
      yPercent: 105,
      rotation: rotationZ,
    },
    {
      yPercent: 0,
      rotation: 0,
      stagger: staggerFrom,
      duration: 1,
      delay: delay,
      ease: "back.out",
    }
  );

  return charsTimeline;
}

// Create hero timeline
const heroTimeline = gsap.timeline();

gsap.set(".hero-card", {
  rotation: -15,
  scale: 0,
});

// Add count-up animation at the start of the timeline
heroTimeline.from(
  "#number-countup",
  {
    textContent: 0, // start from 0
    duration: 3,
    snap: { textContent: 1 }, // increment by 1
    ease: "power4.out",
  },
  0
); // Add this animation at the very start of the timeline

// Add scale-down and fade-out animation for .loader-text, starting 0.5 seconds before count-up finishes
heroTimeline.to(
  ".loader-text",
  {
    scale: 0,
    opacity: 0,
    duration: 0.5, // Duration of the fade-out
    ease: "expoScale",
  },
  "-=0.5"
); // Start 0.5 seconds before the end of the previous animation

heroTimeline.to(
  ".hero-card",
  {
    rotation: 0,
    scale: 1,
    ease: "power4.out",
    duration: 2,
  },
  ">" // Starts after the count-up completes
);

// Add staggered animation for elements inside .nav_component .grid-wrapper
heroTimeline.from(
  ".nav_component .grid-wrapper > *",
  {
    y: "-10rem", // Animate from -10rem on the y-axis
    ease: "power4.out",
    duration: 1, // Duration of the staggered animation
    stagger: 0.2, // Stagger each element by 0.2 seconds
  },
  "-=0.5"
); // Start 0.5 seconds before the data-hero animations complete

// Add animation for the sibling element after .hero-section
heroTimeline.from(
  ".hero-section + section, .project-hero + section",
  {
    y: "10rem",
    opacity: 0,
    duration: 1,
    ease: "power4.out",
  },
  "+=0"
); // Start 0.5 seconds after the previous animation completes

// Add hero text animations to the timeline
document
  .querySelectorAll(".hero-card [data-letter-stagger]")
  .forEach((element) => {
    heroTimeline.add(createLetterAnimation(element), "-=3"); // Adjust timing if needed
  });

heroTimeline.from(
  ".freelance-tag",
  {
    y: "30rem",
    rotationZ: 12,
    opacity: 0,
    ease: "back.out(1.2)",
    duration: 1,
  },
  "-=1"
);

heroTimeline.from(
  ".details-wrapper, .project-intro, .project-tag-wrapper",
  {
    y: "10rem",
    opacity: 0,
    ease: "power4.out",
    duration: 1,
    stagger: 0.2,
  },
  "-=3.5"
);

// Play the hero timeline
heroTimeline.play();

// Handle non-hero text animations
document.querySelectorAll("[data-letter-stagger]").forEach((element) => {
  if (!element.closest(".hero-card")) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          onEnter: () => console.log("ScrollTrigger entered for:", element),
        },
      })
      .add(createLetterAnimation(element));
  }
});

const staggerLinks = document.querySelectorAll("[stagger-link]");
staggerLinks.forEach((link) => {
  const letters = link.querySelectorAll("[stagger-link-text] .char");
  link.addEventListener("mouseenter", function () {
    gsap.to(this, {
      //scale: 1.05, // Scale the link up by 10%
      duration: 0.5,
      ease: "power4.out",
    });
    gsap.to(letters, {
      yPercent: -100,
      duration: 0.5,
      ease: "power4.out",
      stagger: { each: 0.03, from: "start" },
      overwrite: true,
    });
  });
  link.addEventListener("mouseleave", function () {
    gsap.to(this, {
      scale: 1, // Reset the scale of the link
      duration: 0.4,
      ease: "power4.out",
    });
    gsap.to(letters, {
      yPercent: 0,
      duration: 0.4,
      ease: "power4.out",
      stagger: { each: 0.03, from: "end" },
    });
  });
});
