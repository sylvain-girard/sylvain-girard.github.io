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
gsap.set(projectsSection, {
  backgroundColor: getComputedStyle(projectWrappers[0]).getPropertyValue(
    '--projects--project-color')
});
