document.addEventListener("DOMContentLoaded", () => {
  // DOM elements - Scoped to #works
  const worksSection = document.getElementById('works');
  if (!worksSection) {
    console.warn("#works section not found. Skipping works.js initialization.");
    return;
  }

  const pageContainer = worksSection.querySelector(".page-container");
  const horizontalContainer = worksSection.querySelector(".horizontal-container");
  const panelsContainer = worksSection.querySelector(".panels-container");
  const panels = worksSection.querySelectorAll(".panel");
  const progressFill = worksSection.querySelector(".nav-progress-fill");
  const navTextElements = worksSection.querySelectorAll(".navigation .nav-text"); // More specific selector
  const navText = navTextElements.length > 1 ? navTextElements[1] : worksSection.querySelector(".navigation .nav-text"); // Safely get the second one, or the first if only one
  const parallaxElements = worksSection.querySelectorAll(".parallax");
  const leftMenu = worksSection.querySelector(".left-menu");
  const menuBtn = worksSection.querySelector(".menu-btn");
  const sectionNavItems = worksSection.querySelectorAll(".section-nav-item");
  const videoBackground = worksSection.querySelector(".video-background");
  const copyEmailBtn = worksSection.querySelector(".copy-email");
  const copyTooltip = worksSection.querySelector(".copy-tooltip");

  // Check if essential elements exist
  if (!pageContainer || !horizontalContainer || !panelsContainer || !panels.length || !leftMenu || !menuBtn) {
    console.warn("Essential elements for #works section not found. Skipping works.js initialization.");
    return;
  }

  // Constants
  const SMOOTH_FACTOR = 0.065;
  const WHEEL_SENSITIVITY = 1.0;
  const PANEL_COUNT = panels.length;
  const PARALLAX_INTENSITY = 0.5; 

  // State variables
  let targetX = 0;
  let currentX = 0;
  let currentProgress = 0;
  let targetProgress = 0;
  let panelWidth = pageContainer.offsetWidth; // Changed from window.innerWidth
  let maxScroll = (PANEL_COUNT - 1) * panelWidth;
  let isAnimating = false;
  let currentPanel = 0;
  let lastPanel = -1;
  let menuExpanded = false;

  let isDragging = false;
  let startX = 0;
  let startScrollX = 0;
  let velocityX = 0;
  let lastTouchX = 0;
  let lastTouchTime = 0;

  const lerp = (start, end, factor) => start + (end - start) * factor;
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  // Copy email functionality
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      const emailElement = worksSection.querySelector(".email");
      if (emailElement && copyTooltip) {
        const email = emailElement.textContent;
        navigator.clipboard.writeText(email).then(() => {
          copyTooltip.classList.add("active");
          setTimeout(() => {
            copyTooltip.classList.remove("active");
          }, 2000);
        });
      }
    });
  }

  /* COMMENTING OUT CUSTOM SCROLL LOGIC
  const updateParallax = () => {
    parallaxElements.forEach((element) => {
      if (!element) return;
      const speed = Number.parseFloat(element.dataset.speed) || 0.2;
      const PARALLAX_STRENGTH = 0.2; // Adjusted from PARALLAX_INTENSITY for more subtle effect
      const moveX = -currentX * speed * PARALLAX_STRENGTH;
      element.style.transform = `translateX(${moveX}px) translateZ(0)`; // Added translateZ for potential perf improvement
    });
  };

  const updateDimensions = (animate = true) => {
    if (!pageContainer) return; // Guard clause
    panelWidth = pageContainer.offsetWidth;
    maxScroll = (PANEL_COUNT - 1) * panelWidth;
    targetX = currentPanel * panelWidth;

    panels.forEach((panel) => {
      panel.style.width = `${panelWidth}px`;
    });

    if (animate && panelsContainer) {
      panelsContainer.classList.add("transitioning");
      setTimeout(() => {
        panelsContainer.classList.remove("transitioning");
      }, 400); // Match CSS transition time
    }
    if (panelsContainer) {
        panelsContainer.style.transform = `translateX(-${currentX}px) translateZ(0)`;
    }
    // updateParallax(); // This would call the old one
  };
  */

  // --- MENU FUNCTIONALITY ---
  const animateMenuItems = (show) => {
    sectionNavItems.forEach((item, index) => {
      if (show) {
        setTimeout(() => {
          item.classList.add("animate-in");
        }, 50 + index * 30); // Stagger animation
      } else {
        item.classList.remove("animate-in");
      }
    });
  };

  if (menuBtn && leftMenu && worksSection && sectionNavItems.length > 0) {
    menuBtn.addEventListener("click", () => {
      menuExpanded = !menuExpanded;
      leftMenu.classList.toggle("expanded");
      worksSection.classList.toggle("works-menu-expanded"); // Used for page-container push

      if (menuExpanded) {
        setTimeout(() => {
          animateMenuItems(true);
        }, 150); // Delay to sync with menu expansion
      } else {
        animateMenuItems(false);
      }
    });

    sectionNavItems.forEach((item) => {
      item.addEventListener("click", () => {
        const targetPanelIndex = Number.parseInt(item.getAttribute("data-index"));
        
        if (!isNaN(targetPanelIndex) && typeof gsap !== 'undefined' && window.worksHorizontalScrollTimeline && PANEL_COUNT > 0) {
          let targetProgress = 0;
          if (PANEL_COUNT > 1) {
            targetProgress = targetPanelIndex / (PANEL_COUNT - 1);
          }
          targetProgress = Math.max(0, Math.min(1, targetProgress)); // Clamp progress

          gsap.to(window.worksHorizontalScrollTimeline, {
            progress: targetProgress,
            duration: 0.75, 
            ease: 'power2.inOut',
            onUpdate: function() {
              // During the tween, call updateNavigation with the timeline's current progress
              if (window.worksHelpers && window.worksHelpers.updateNavigation) {
                window.worksHelpers.updateNavigation(this.progress()); // this.progress() gets progress of this tween's target (the timeline)
              }
            },
            onComplete: function() {
              // Ensure final state is perfectly set using the targetProgress
              if (window.worksHelpers && window.worksHelpers.updateNavigation) {
                window.worksHelpers.updateNavigation(targetProgress);
                console.log("[GSAP Nav Click onComplete] Forced updateNavigation with progress: ", targetProgress);
              }
            }
          });
        }
        
        // This part is primarily for closing the menu on mobile after a click
        if (window.innerWidth < 768 && menuExpanded) {
          menuExpanded = false; // Update state
          leftMenu.classList.remove("expanded");
          worksSection.classList.remove("works-menu-expanded");
          animateMenuItems(false);
        }
      });
    });
  }
  // --- END MENU FUNCTIONALITY ---

  const splitTexts = worksSection.querySelectorAll(".split-text");
  splitTexts.forEach((text) => {
    const words = text.textContent.trim().split(/\s+/);
    text.innerHTML = words
      .map((word) => `<span class="word">${word}</span>`)
      .join(" ");
    const wordElements = text.querySelectorAll(".word");
    wordElements.forEach((word, index) => {
      word.style.transitionDelay = `${index * (parseFloat(getComputedStyle(worksSection).getPropertyValue('--word-stagger-delay')) || 0.02)}s`;
    });
  });

  /* COMMENTING OUT CUSTOM SCROLL LOGIC
  const updatePageCount = () => {
    if (!navText) return;
    const currentPanelIndex = Math.round(currentX / panelWidth) + 1;
    if (currentPanelIndex > 0 && currentPanelIndex <= PANEL_COUNT) {
        const formattedIndex = currentPanelIndex.toString().padStart(2, "0");
        const totalPanels = PANEL_COUNT.toString().padStart(2, "0");
        navText.textContent = `${formattedIndex} / ${totalPanels}`;

        sectionNavItems.forEach((item, index) => {
            item.classList.toggle("active", index === currentPanelIndex - 1);
        });
    }
  };

  const updateProgress = () => {
    if (!progressFill || maxScroll === 0) return;
    targetProgress = clamp(currentX / maxScroll, 0, 1);
    currentProgress = lerp(currentProgress, targetProgress, SMOOTH_FACTOR * 1.5);
    progressFill.style.transform = `scaleX(${currentProgress})`;
  };

  const updateActivePanel = () => {
    const newCurrentPanel = Math.round(currentX / panelWidth);
    if (newCurrentPanel !== currentPanel || lastPanel === -1) { // lastPanel condition for initial load
        currentPanel = newCurrentPanel;
        panels.forEach((panel, index) => {
            const isActive = index === currentPanel;
            const isVisited = index < currentPanel;
            panel.classList.toggle("active", isActive);
            panel.classList.toggle("visited", isVisited);
        });
        lastPanel = currentPanel;
    }
  };
  
  const animate = () => {
    if (!panelsContainer) { isAnimating = false; return; }
    currentX = lerp(currentX, targetX, SMOOTH_FACTOR);
    panelsContainer.style.transform = `translateX(-${currentX}px) translateZ(0)`;
    // updateProgress();
    // updatePageCount();
    // updateActivePanel();
    // updateParallax(); // Old one
    if (Math.abs(targetX - currentX) > 0.01) { // Adjusted threshold for stopping animation
      requestAnimationFrame(animate);
    } else {
      currentX = targetX; // Snap to final position
      panelsContainer.style.transform = `translateX(-${currentX}px) translateZ(0)`;
      // updateProgress(); updatePageCount(); updateActivePanel(); updateParallax(); // Final update // Old one
      isAnimating = false;
    }
  };

  const startAnimation = () => {
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(animate);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    targetX = clamp(targetX + e.deltaY * WHEEL_SENSITIVITY, 0, maxScroll);
    startAnimation();
  };

  const handleMouseDown = (e) => {
    if (e.target.closest(".left-menu") || e.target.closest(".copy-email")) return;
    isDragging = true;
    startX = e.clientX;
    startScrollX = currentX;
    velocityX = 0; // Reset velocity
    lastTouchX = e.clientX;
    lastTouchTime = Date.now();
    if(horizontalContainer) horizontalContainer.style.cursor = "grabbing"; // Scoped cursor
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastTouchX; // More robust: calculate delta from last move
    targetX = clamp(targetX - dx, 0, maxScroll); // Adjust targetX based on movement since last event
    
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTouchTime;
    if (timeDelta > 0) {
      velocityX = (dx / timeDelta) * 15; // dx (positive for right, negative for left), velocityX reflects this.
    }
    lastTouchX = e.clientX;
    lastTouchTime = currentTime;
    startAnimation();
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    isDragging = false;
    if(horizontalContainer) horizontalContainer.style.cursor = "grab"; // Scoped cursor

    if (Math.abs(velocityX) > 0.5) {
      targetX = clamp(targetX - velocityX * 8, 0, maxScroll); 
    }
    const nearestPanel = Math.round(targetX / panelWidth);
    targetX = nearestPanel * panelWidth;
    startAnimation();
  };

  const handleTouchStart = (e) => {
    if (e.target.closest(".left-menu") || e.target.closest(".copy-email")) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    startScrollX = currentX;
    velocityX = 0;
    lastTouchX = e.touches[0].clientX;
    lastTouchTime = Date.now();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent page scroll on touch devices
    const currentTouchX = e.touches[0].clientX;
    const dx = currentTouchX - lastTouchX;
    targetX = clamp(targetX - dx, 0, maxScroll);

    const currentTime = Date.now();
    const timeDelta = currentTime - lastTouchTime;
    if (timeDelta > 0) {
      velocityX = (dx / timeDelta) * 12;
    }
    lastTouchX = currentTouchX;
    lastTouchTime = currentTime;
    startAnimation();
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    if (Math.abs(velocityX) > 0.5) {
        targetX = clamp(targetX - velocityX * 6, 0, maxScroll);
    }
    const nearestPanel = Math.round(targetX / panelWidth);
    targetX = nearestPanel * panelWidth;
    startAnimation();
  };

  // Event listeners
  if(horizontalContainer) {
      // horizontalContainer.addEventListener("wheel", handleWheel, { passive: false });
      // horizontalContainer.addEventListener("mousedown", handleMouseDown);
      // horizontalContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
      // horizontalContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
      // horizontalContainer.addEventListener("touchend", handleTouchEnd, { passive: true });
  }
  // window.addEventListener("mousemove", handleMouseMove);
  // window.addEventListener("mouseup", handleMouseUp);
  
  window.addEventListener("resize", () => {
    clearTimeout(window.resizeTimeout);
    // window.resizeTimeout = setTimeout(() => {
    //     updateDimensions(); 
    //     currentX = currentPanel * panelWidth; 
    //     targetX = currentX;
    //     if(panelsContainer) panelsContainer.style.transform = `translateX(-${currentX}px) translateZ(0)`;
    //     startAnimation();
    // }, 250);
  });
  */

  parallaxElements.forEach((img) => {
    if (img.tagName === "IMG") {
      if (img.complete) {
        img.classList.add("loaded");
      } else {
        img.addEventListener("load", () => img.classList.add("loaded"));
      }
    } else {
        img.classList.add("loaded");
    }
  });

  if (videoBackground) {
    videoBackground.playbackRate = 0.6;
  }

  /* COMMENTING OUT CUSTOM SCROLL LOGIC
  updateDimensions(false);
  currentX = targetX;
  if(panelsContainer) panelsContainer.style.transform = `translateX(-${currentX}px) translateZ(0)`;
  updateActivePanel();
  updatePageCount();
  updateProgress();
  */

  // Initial active classes for panel 0 - RETAINED
  setTimeout(() => {
    if (panels.length > 0) panels[0].classList.add("active");
    if (sectionNavItems.length > 0) sectionNavItems[0].classList.add("active");
    // updateParallax();
  }, 100);
  
  // --- HELPER FUNCTION FOR SCROLLTRIGGER INTEGRATION ---
  
  window.worksHelpers = {
    updateNavigation: (progress) => {
      console.log("[worksHelpers.updateNavigation] Received progress:", progress); // DEBUG LOG
      if (progressFill) {
        progressFill.style.transform = `scaleX(${progress})`;
      }
      
      if (navText) {
        const currentPanelIndex = Math.min(Math.floor(progress * PANEL_COUNT) + 1, PANEL_COUNT);
        const formattedIndex = currentPanelIndex.toString().padStart(2, "0");
        const totalPanels = PANEL_COUNT.toString().padStart(2, "0");
        navText.textContent = `${formattedIndex} / ${totalPanels}`;
      }
      
      const newCurrentPanel = Math.min(Math.floor(progress * PANEL_COUNT), PANEL_COUNT - 1);
      panels.forEach((panel, index) => {
        const isActive = index === newCurrentPanel;
        const isVisited = index < newCurrentPanel;
        panel.classList.toggle("active", isActive);
        panel.classList.toggle("visited", isVisited);
      });
      
      sectionNavItems.forEach((item, index) => {
        item.classList.toggle("active", index === newCurrentPanel);
      });
    },
    
    updateParallax: (scrollX) => {
      parallaxElements.forEach((element) => {
        if (!element) return;
        const speed = Number.parseFloat(element.dataset.speed) || 0.2;
        const PARALLAX_STRENGTH = 0.2;
        const moveX = -scrollX * speed * PARALLAX_STRENGTH;
        element.style.transform = `translateX(${moveX}px) translateZ(0)`;
      });
    }
  };
});
