function initBackgroundEffects() {
  // Check if GSAP and ScrollTrigger are available
  if (!window.gsap || !window.ScrollTrigger) {
    console.error('GSAP or ScrollTrigger not loaded. Cannot initialize background effects.');
    return;
  }
  
  // Select all project wrapper elements
  const projectWrappers = gsap.utils.toArray('.project-stacked-wrapper');
  const projectsSection = document.querySelector('.projects-section');

  // Create ScrollTrigger for each project wrapper
  projectWrappers.forEach((wrapper) => {
    const projectNumber = wrapper.getAttribute('data-project');
    const projectColor = getComputedStyle(wrapper).getPropertyValue('--projects--project-color');

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        gsap.to(projectsSection, {
          backgroundColor: projectColor,
          duration: 0.2,
          ease: 'power2.out'
        });
      },
      onEnterBack: () => {
        gsap.to(projectsSection, {
          backgroundColor: projectColor,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    });
  });

  // Optional: Set initial background color based on first project
  if (projectWrappers.length > 0) {
    gsap.set(projectsSection, {
      backgroundColor: getComputedStyle(projectWrappers[0]).getPropertyValue(
        '--projects--project-color')
    });
  }
}

// Check if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // If already loaded, initialize immediately
  setTimeout(initBackgroundEffects, 100);
} else {
  // Otherwise wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initBackgroundEffects, 100);
  });
}
