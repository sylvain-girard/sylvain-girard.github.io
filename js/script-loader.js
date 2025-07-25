// JS Script Loader
// This script handles loading JS files based on the page type
// and ensures they load after DOM content is loaded

document.addEventListener("DOMContentLoaded", function() {
  // Determine if current page is homepage
  const isHomepage = window.location.pathname === "/" || 
                   window.location.pathname === "/index.html" || 
                   window.location.href.endsWith("index.html");
  
  // Determine the path prefix based on directory depth
  const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
  // If we're in a subdirectory (not root), we need to go up one level
  const pathPrefix = pathSegments.length > 1 || (pathSegments.length === 1 && pathSegments[0] !== 'index.html') ? '../' : '';
  
  // Function to load a script
  function loadScript(src, isModule = false) {
    return new Promise((resolve, reject) => {
      // Don't modify external URLs (starting with http)
      const scriptSrc = src.startsWith('http') ? src : pathPrefix + src;
      
      // Check if script is already loaded
      if (document.querySelector(`script[src="${scriptSrc}"]`)) {
        console.log(`Script already loaded: ${scriptSrc}`);
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      if (isModule) {
        script.type = 'module';
      }
      
      script.onload = () => {
        console.log(`Loaded: ${scriptSrc}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`Failed to load: ${scriptSrc}`);
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
        'js/marquee.js',
        'js/footer.js',
        'js/vimeo-player.js',
        'https://flackr.github.io/scroll-timeline/dist/scroll-timeline.js',
        'js/next-project.js'
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
          'js/projects.js',
          'js/three-feature.js'
        ];
        
        return Promise.all(homepageScripts.map(src => {
          if (src === 'js/three-feature.js') {
            return loadScript(src, true);
          }
          return loadScript(src);
        }));
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