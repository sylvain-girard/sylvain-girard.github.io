  const cursor = document.querySelector(".cursor-wrapper");

  document.addEventListener("mousemove", (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: "power2.out",
    });
  });

  document.querySelectorAll("a, button").forEach((link) => {
    link.addEventListener("mouseenter", () => {
      gsap.to(cursor, {
        scale: 2,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    link.addEventListener("mouseleave", () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
