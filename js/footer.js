document.querySelectorAll("[data-animate-trigger]").forEach((trigger) => {
  const staggerElements = trigger.children;

  gsap.set(staggerElements, {
    transformOrigin: "left",
  });

  gsap.from(staggerElements, {
    scrollTrigger: {
      trigger: trigger,
      start: "top bottom", // adjust this as needed
      end: "bottom bottom", // adjust this as needed
      toggleActions: "play none none none",
    },
    y: "120%",
    rotation: 20,
    ease: "back.out",
    duration: 0.5,
    stagger: {
      each: 0.2,
    },
  });
});
