// JS Script Loader
// This script handles loading JS files based on the page type
// and ensures they load after DOM content is loaded

document.addEventListener("DOMContentLoaded", function() {
  // Determine if current page is homepage
  const isHomepage = window.location.pathname === "/" || 
                   window.location.pathname === "/index.html" || 
                   window.location.href.endsWith("index.html");
  
  // Function to load a script
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        console.log(`Script already loaded: ${src}`);
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        console.log(`Loaded: ${src}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`Failed to load: ${src}`);
        reject();
      };
      
      document.body.appendChild(script);
    });
  }

  // Load GSAP first (required by many other scripts)
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/gsap.min.js')
    .then(() => {
      console.log('GSAP loaded');
      
      // Then load ScrollTrigger (which depends on GSAP)
      return loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/ScrollTrigger.min.js');
    })
    .then(() => {
      console.log('ScrollTrigger loaded');
      
      // Then load SplitType
      return loadScript('https://unpkg.com/split-type');
    })
    .then(() => {
      console.log('SplitType loaded');
      
      // Register GSAP plugins
      if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        console.log('GSAP plugins registered');
      }
      
      // Load global scripts
      const globalScripts = [
        'js/main.js',
        'js/text.js',
        'js/cursor.js',
        'js/footer.js',
        'js/vimeo-player.js'
      ];
      
      return Promise.all(globalScripts.map(src => loadScript(src)));
    })
    .then(() => {
      console.log('All global scripts loaded');
      
      // Load homepage-specific scripts if on homepage
      if (isHomepage) {
        console.log('Loading homepage scripts...');
        const homepageScripts = [
          'js/background.js',
          'js/marquee.js',
          'js/projects.js'
        ];
        
        return Promise.all(homepageScripts.map(src => loadScript(src)));
      }
    })
    .then(() => {
      if (isHomepage) {
        console.log('All homepage scripts loaded');
      }
    })
    .catch(error => {
      console.error('Error loading scripts:', error);
    });
}); 