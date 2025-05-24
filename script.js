// Future JavaScript code will go here 

document.addEventListener("DOMContentLoaded", () => {
  // --- PREPARE TEXT FOR TYPING ANIMATION (Services Section) ---
  const projectItemsForTyping = document.querySelectorAll('.sticky-content-block.main-title-sticky-content .project-item');
  projectItemsForTyping.forEach(item => {
      const nameElement = item.querySelector('.project-name');
      const directorElement = item.querySelector('.project-director');
      if (nameElement) {
          nameElement.dataset.originalText = nameElement.textContent.trim();
          // nameElement.textContent = ''; // Temporarily disable clearing for debug
      }
      if (directorElement) {
          directorElement.dataset.originalText = directorElement.textContent.trim();
          // directorElement.textContent = ''; // Temporarily disable clearing for debug
      }
  });
  // --- END PREPARATION ---

  const restartBtn = document.querySelector(".restart-btn");
  const additionalDots = document.querySelectorAll(".dot:nth-child(n+5)");
  const centerDot = document.querySelector(".center-dot");

  // Register GSAP plugins (ScrollTrigger is already included via CDN by index.html, but good practice to register if bundling)
  // gsap.registerPlugin(CustomEase, ScrollTrigger); // ScrollTrigger added here if not globally available
  gsap.registerPlugin(CustomEase); // Assuming ScrollTrigger is globally available from CDN

  // Create custom easing functions
  CustomEase.create("customEase", "0.6, 0.01, 0.05, 1");
  CustomEase.create("blurEase", "0.25, 0.1, 0.25, 1");
  CustomEase.create("counterEase", "0.35, 0.0, 0.15, 1");
  CustomEase.create("gentleIn", "0.38, 0.005, 0.215, 1");
  CustomEase.create("hop", "0.9, 0, 0.1, 1");

  function animateLines() {
    const timeline = gsap.timeline({
      onComplete: function() {
        this.restart(); // Restart the timeline once it completes
      }
    });

    // Fade in header and items with stagger - keeping original timing
    timeline.to(".projects-header", {
      opacity: 1, // Ensure it starts/becomes visible
      duration: 0.45,
      ease: "customEase"
    });

    timeline.to(".project-item", {
      opacity: 1, // Ensure it starts/becomes visible
      duration: 1,
      stagger: 0.075,
      ease: "gentleIn"
    });

    // Change color of items - keeping original timing
    timeline.to(".project-item", {
      color: "#fff",
      duration: 0.30,
      stagger: 0.075,
      ease: "blurEase"
    });

    // Fade out items with stagger - keeping original timing
    /* timeline.to(".project-item", { // Temporarily disable fade out
      opacity: 0,
      duration: 0.30,
      stagger: 0.075,
      delay: 5,
      ease: "counterEase"
    }); */

    /* timeline.to(".projects-header", { // Temporarily disable fade out
      opacity: 0,
      duration: 0.15,
      ease: "customEase",
      delay: 0.5 // Added a short delay before looping to make it smoother
    }); */

    // Show restart button
    timeline.to(restartBtn, {
      opacity: 1,
      duration: 0.3,
      ease: "hop"
    });
  }

  // Start animation for project items if they exist
  if (document.querySelector(".projects-header") && document.querySelectorAll(".project-item").length > 0 && restartBtn) {
    animateLines();
  }
  
  // Restart button hover animations if restartBtn exists
  if (restartBtn) {
    restartBtn.addEventListener("mouseenter", () => {
        gsap.to(additionalDots, {
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "customEase"
        });
        gsap.to(centerDot, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "gentleIn"
        });
    });

    restartBtn.addEventListener("mouseleave", () => {
        gsap.to(additionalDots, {
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "customEase"
        });
        gsap.to(centerDot, {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        ease: "gentleIn"
        });
    });
  }

  // GSAP ScrollTrigger Horizontal Scroll for #works section
  const worksSection = document.querySelector('#works');
  const panelsContainer = worksSection ? worksSection.querySelector('.panels-container') : null;
  
  if (worksSection && panelsContainer) {
      const panels = Array.from(panelsContainer.children).filter(child => child.matches('section.panel'));
      const numPanels = panels.length;

      if (numPanels > 0) {
          // Set the width of the panels-container to hold all panels side-by-side
          gsap.set(panelsContainer, { width: (numPanels * 100) + 'vw' });

          // Create a GSAP timeline for the horizontal scroll animation
          let horizontalScrollTimeline = gsap.timeline();
          window.worksHorizontalScrollTimeline = horizontalScrollTimeline; // Make it globally accessible

          // Animate the panelsContainer's x position
          // The total movement will be the width of all panels minus one viewport width,
          // effectively showing each panel one by one.
          horizontalScrollTimeline.to(panelsContainer, {
              x: () => -(panelsContainer.scrollWidth - window.innerWidth),
              ease: "none" // Linear ease for direct scrub control by ScrollTrigger
          });

          // Create the ScrollTrigger instance
          ScrollTrigger.create({
              trigger: '#works',
              pin: '#works', // Pin the #works section
              scrub: 1, // Smooth scrubbing (1 second to catch up). Can be true for immediate.
              start: "top top", // Start when the top of #works hits the top of the viewport
              end: () => "+=" + (panelsContainer.scrollWidth - window.innerWidth),
              animation: horizontalScrollTimeline,
              invalidateOnRefresh: true, // Recalculate on resize/refresh
              // anticipatePin: 1, // Optional: may help with pin jumping if observed
              markers: false, // Optional: for debugging ScrollTrigger start/end points
              onUpdate: self => {
                console.log("[ScrollTrigger onUpdate] Progress:", self.progress); // DEBUG LOG
                if (window.worksHelpers) {
                  const currentScrollAmount = self.progress * (panelsContainer.scrollWidth - window.innerWidth);
                  window.worksHelpers.updateNavigation(self.progress);
                  window.worksHelpers.updateParallax(currentScrollAmount);
                }
              }
          });
      }
  } else {
      console.warn('#works section or .panels-container not found for horizontal scroll setup using ScrollTrigger.');
  }

  async function typeText(element, text) {
    // element.textContent = ''; // Already handled by initial prep, or disabled for debug
    element.classList.add('is-typing');
    for (let i = 0; i < text.length; i++) {
      if (nameElement && nameElement.dataset.originalText) {
        // await typeText(nameElement, nameElement.dataset.originalText); // Temporarily disable typing
        nameElement.textContent = nameElement.dataset.originalText; // Just show text directly
      }
      
      if (directorElement && directorElement.dataset.originalText) {
        // await new Promise(resolve => setTimeout(resolve, itemDelay)); 
        // await typeText(directorElement, directorElement.dataset.originalText); // Temporarily disable typing
        directorElement.textContent = directorElement.dataset.originalText; // Just show text directly
      }
      
      // Ensure delay only if something was typed to prevent unnecessary long waits for empty items
      /* if ((nameElement && nameElement.dataset.originalText) || (directorElement && directorElement.dataset.originalText)) {
        await new Promise(resolve => setTimeout(resolve, nextItemDelay));
      } */
    }
  }

  // Optional: Trigger animation when the services section is in view
  // ... existing code ...
}); 

// Removed old ScrollMagic related code that was here previously. 