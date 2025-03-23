function initProjectEffects() {
  // Check if GSAP and ScrollTrigger are available
  if (!window.gsap || !window.ScrollTrigger) {
    console.error('GSAP or ScrollTrigger not loaded. Cannot initialize project effects.');
    return;
  }

  let proxy = { rotation: 0 },
    rotationSetter = gsap.quickSetter(".project-details", "rotationX",
    "deg"), // Adjust the selector as needed
    clamp = gsap.utils.clamp(-70, 70); // Adjust these values based on the desired effect
  // ScrollTrigger to track the scrolling
  ScrollTrigger.create({
    onUpdate: (self) => {
      let rotation = clamp(self.getVelocity() / -50); // Adjust the divisor for sensitivity
      if (Math.abs(rotation) > Math.abs(proxy.rotation)) {
        proxy.rotation = rotation;
        gsap.to(proxy, {
          rotation: 0,
          duration: 1,
          //ease: "power4",
          ease: "power1",
          overwrite: true,
          onUpdate: () => rotationSetter(proxy.rotation),
        });
      }
    },
  });
  // Set up the initial transform origin. Adjust the selector as needed.
  gsap.set(".project-details", {
    transformOrigin: "center center",
    force3D: true,
  });
  ////////////////////// Scroll in-out 3D end
  ////////////////////// Hover
  function findSiblingWithClass(element, primaryClass, comboClass) {
    let sibling = element.parentElement.firstChild;
    while (sibling) {
      if (sibling.nodeType === 1) {
        // Ensure it's an element node
        const child = sibling.querySelector(`.${primaryClass}.${comboClass}`);
        if (child) {
          return child;
        }
      }
      sibling = sibling.nextElementSibling;
    }
    return null;
  }

  document.querySelectorAll(".project-details").forEach((detail) => {
    // Initialize the timeline for each project detail and pause it
    const tl = gsap.timeline({ paused: true });
    // Adjusted to target the element with both 'marquee' and 'top' classes
    const overlay = findSiblingWithClass(detail, "marquee", "top");
    // Add animations to the timeline
    tl.to(detail, { scale: 1.05, duration: 0.3, ease: "power1.inOut" })
      .to(
        detail.querySelector(".project-details-wrapper"), { y: 0, duration: 0.3 },
        "<"
      ) // Start this animation at the same time as the previous one
      .to(
        detail.querySelector(".project-image-overlay"), { opacity: 1, duration: 0.7 },
        "<"
      );
    if (overlay) {
      tl.to(overlay, { opacity: 0, duration: 0.7 }, "<");
    }
    // Play the timeline on mouseenter
    detail.addEventListener("mouseenter", () => {
      tl.play();
    });
    // Reverse the timeline on mouseleave
    detail.addEventListener("mouseleave", () => {
      tl.reverse();
    });
  });
  ////////////////////// Hover end
  ////////////////////// Follow Mouse
  document.querySelectorAll(".project-details").forEach((detail) => {
    detail.addEventListener("mousemove", (e) => {
      const rect = detail.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(detail, {
        x: x * 0.1, // Adjust this value for the x-axis movement intensity
        y: y * 0.1, // Adjust this value for the y-axis movement intensity
        rotationY: (x / rect.width) * 15, // Rotation intensity based on mouse X position
        rotationX: (y / rect.height) * -
        15, // Rotation intensity based on mouse Y position
        ease: "elastic.out(1,0.5)",
        duration: 1,
      });
    });
    detail.addEventListener("mouseleave", () => {
      gsap.to(detail, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1,0.5)",
        duration: 1,
      });
    });
  });
}

// Check if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // If already loaded, initialize immediately
  setTimeout(initProjectEffects, 100);
} else {
  // Otherwise wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initProjectEffects, 100);
  });
}
