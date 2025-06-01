function initializeVimeoPlayer(container) {
  const iframe = container.querySelector('[data-vimeo-player]');
  const player = new Vimeo.Player(iframe);
  const playPauseButton = container.querySelector('[data-vimeo-play-pause-button]');
  const playIcon = container.querySelector('[data-vimeo-play-icon]');
  const pauseIcon = container.querySelector('[data-vimeo-pause-icon]');
  const audioButton = container.querySelector('[data-vimeo-audio-button]');
  const audioOnIcon = container.querySelector('[data-vimeo-audio-on]');
  const audioOffIcon = container.querySelector('[data-vimeo-audio-off]');
  // Get custom time range from data attributes
  const startTime = parseFloat(container.getAttribute('data-vimeo-start')) || 0;
  const endTime = parseFloat(container.getAttribute('data-vimeo-end')) || null;
  // Check if hover play is enabled
  const hoverPlayEnabled = container.hasAttribute('data-vimeo-hover-play');
  // Set initial states
  let playing = false;
  let audioEnabled = false;
  let isInView = false;
  let userPaused = false; // Track if user manually paused the video
  // Function to check if element is in viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0 &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right >= 0
    );
  }
  // Function to handle visibility changes
  function handleVisibilityChange() {
    const wasInView = isInView;
    isInView = isElementInViewport(iframe);
    // Only take action if visibility has changed and not user-paused
    if (!wasInView && isInView && playing && !userPaused) {
      // Coming into view while playing
      player.setCurrentTime(startTime).then(() => player.play());
    } else if (wasInView && !isInView && playing) {
      // Going out of view while playing
      player.pause();
    }
  }
  // Handle end time
  function checkEndTime() {
    if (endTime !== null) {
      player.getCurrentTime().then(currentTime => {
        if (currentTime >= endTime) {
          player.setCurrentTime(startTime);
        }
      });
    }
  }
  // Set up timeupdate event for checking end time
  player.on('timeupdate', function() {
    checkEndTime();
  });
  // Basic initialization
  player.ready().then(() => {
    // Set initial volume to 0 (muted)
    return player.setVolume(0);
  }).then(() => {
    // Initial time setting
    return player.setCurrentTime(startTime);
  }).then(() => {
    // Initial visibility check
    isInView = isElementInViewport(iframe);
    // Start with video paused and showing play button
    pauseIcon.classList.add('hide-this');
    playIcon.classList.remove('hide-this');
    console.log("Vimeo player initialized successfully");
  }).catch(error => {
    console.error("Error initializing Vimeo player:", error);
  });
  // Add click event to the play/pause button
  if (playPauseButton) {
    playPauseButton.addEventListener('click', function() {
      if (playing) {
        player.pause().then(() => {
          pauseIcon.classList.add('hide-this');
          playIcon.classList.remove('hide-this');
          playing = false;
          userPaused = true; // User manually paused
        }).catch(err => console.error("Error pausing:", err));
      } else {
        player.setCurrentTime(startTime).then(() => {
          return player.play();
        }).then(() => {
          playIcon.classList.add('hide-this');
          pauseIcon.classList.remove('hide-this');
          playing = true;
          userPaused = false; // User manually played
        }).catch(err => console.error("Error playing:", err));
      }
    });
  } else {
    console.error('[Vimeo Player] Play/Pause button ([data-vimeo-play-pause-button]) not found in container:', container);
  }
  // Add click event to the audio button
  if (audioButton) {
    audioButton.addEventListener('click', function() {
      if (audioEnabled) {
        player.setVolume(0).then(() => {
          audioOnIcon.classList.add('hide-this');
          audioOffIcon.classList.remove('hide-this');
          audioEnabled = false;
        }).catch(err => console.error("Error muting:", err));
      } else {
        player.setVolume(1).then(() => {
          audioOffIcon.classList.add('hide-this');
          audioOnIcon.classList.remove('hide-this');
          audioEnabled = true;
        }).catch(err => console.error("Error unmuting:", err));
      }
    });
  } else {
    console.warn('[Vimeo Player] Audio button ([data-vimeo-audio-button]) not found in container:', container);
  }
  // Add hover events if hover play is enabled
  if (hoverPlayEnabled) {
    container.addEventListener('mouseenter', function() {
      if (isInView && !userPaused) {
        player.play().then(() => {
          playIcon.classList.add('hide-this');
          pauseIcon.classList.remove('hide-this');
          playing = true;
        }).catch(err => console.error("Error playing on hover:", err));
      }
    });
    container.addEventListener('mouseleave', function() {
      if (isInView && !userPaused) {
        player.pause().then(() => {
          pauseIcon.classList.add('hide-this');
          playIcon.classList.remove('hide-this');
          playing = false;
        }).catch(err => console.error("Error pausing on hover out:", err));
      }
    });
  }
  // Update icons if the video state changes elsewhere
  player.on('play', function() {
    playing = true;
    playIcon.classList.add('hide-this');
    pauseIcon.classList.remove('hide-this');
  });
  player.on('pause', function() {
    // Only update UI if in view
    if (isInView) {
      playing = false;
      pauseIcon.classList.add('hide-this');
      playIcon.classList.remove('hide-this');
    }
  });
  // Set up scroll and resize listeners for visibility detection
  window.addEventListener('scroll', handleVisibilityChange, { passive: true });
  window.addEventListener('resize', handleVisibilityChange, { passive: true });
  // Initial visibility check
  setTimeout(handleVisibilityChange, 1000); // Delay initial check
}
// Initialize all Vimeo players when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlayers);
} else {
  // DOM already loaded
  initializePlayers();
}
function initializePlayers() {
  // Add a delay to ensure Vimeo API is fully loaded
  setTimeout(() => {
    const containers = document.querySelectorAll('[data-vimeo-container]');
    containers.forEach(container => {
      initializeVimeoPlayer(container);
    });
    console.log("All players initialized");
  }, 500);
} 