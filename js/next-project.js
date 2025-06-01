function initNextProject() {
// Animate .next-up-wrapper into view on scroll
const nextUpWrapper = document.querySelector('.next-up-wrapper');
if (nextUpWrapper) {
  const elementHeight = nextUpWrapper.offsetHeight;
  const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const extraPaddingPixels = 6 * remInPixels; // 4rem of bottom padding for initial offset calculation
  
  const initialYOffset = elementHeight + extraPaddingPixels;

  // Set initial state: horizontally centered and vertically offset below its final position
  gsap.set(nextUpWrapper, { 
    xPercent: -50, // Maintains horizontal centering based on `left: 50%`
    y: initialYOffset,
    scale: 0
  });

  ScrollTrigger.create({
    trigger: 'footer', // Changed to trigger when the footer comes into view
    start: "top bottom", // When the top of the footer hits the bottom of the viewport
    end: "bottom top", // When the bottom of the footer leaves the top of the viewport
    //markers: true, // Uncomment for debugging
    // once: true, // Removed to allow replay
    toggleActions: "play none none reverse", // Handles play and reverse on scroll direction
    onEnter: () => {
      gsap.to(nextUpWrapper, {
        y: 0, // Animate to its final vertical position (respecting `bottom: 4rem` from CSS)
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.5)"
      });
    },
    onLeaveBack: () => { // Added to reverse animation on scrolling up
      gsap.to(nextUpWrapper, {
        y: initialYOffset, // Animate back to its initial vertical position
        scale: 0,
        duration: 0.4,
        ease: "back.in(1.5)" // Use 'back.in' for a consistent feel when reversing
      });
    }
  });
}
}

// Refresh ScrollTrigger after all assets are loaded
window.addEventListener('load', () => {
  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

// Wait for both DOM and script loader to be ready
function waitForScriptLoader() {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // If already loaded, wait a bit for script loader to finish
    setTimeout(initNextProject, 1000);
  } else {
    // Otherwise wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initNextProject, 1000);
    });
  }
}

// Start waiting for initialization
waitForScriptLoader(); 