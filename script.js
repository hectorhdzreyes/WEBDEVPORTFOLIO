// Future JavaScript code will go here 

document.addEventListener("DOMContentLoaded", () => {
  // --- PREPARE TEXT FOR TYPING ANIMATION (Services Section) ---
  const projectItemsForTyping = document.querySelectorAll('.sticky-content-block.main-title-sticky-content .project-item');
  projectItemsForTyping.forEach(item => {
      const nameElement = item.querySelector('.project-name');
      const directorElement = item.querySelector('.project-director');
      if (nameElement) {
          nameElement.dataset.originalText = nameElement.textContent.trim();
          nameElement.textContent = ''; // Re-enable clearing for animation
      }
      if (directorElement) {
          directorElement.dataset.originalText = directorElement.textContent.trim();
          directorElement.textContent = ''; // Re-enable clearing for animation
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
  
  if (worksSection) { // Only run if #works section exists
      const panelsContainer = worksSection.querySelector('.panels-container');
      if (panelsContainer) {
      const panels = Array.from(panelsContainer.children).filter(child => child.matches('section.panel'));
      const numPanels = panels.length;

      if (numPanels > 0) {
          gsap.set(panelsContainer, { width: (numPanels * 100) + 'vw' });

          let horizontalScrollTimeline = gsap.timeline();
              window.worksHorizontalScrollTimeline = horizontalScrollTimeline;

          horizontalScrollTimeline.to(panelsContainer, {
              x: () => -(panelsContainer.scrollWidth - window.innerWidth),
                  ease: "none"
          });

          ScrollTrigger.create({
              trigger: '#works',
                  pin: '#works',
                  scrub: 1,
                  start: "top top",
              end: () => "+=" + (panelsContainer.scrollWidth - window.innerWidth),
              animation: horizontalScrollTimeline,
                  invalidateOnRefresh: true,
                  markers: false,
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
          console.warn('.panels-container not found within #works for horizontal scroll setup.');
      }
  } else {
      console.log('#works section not found, skipping horizontal scroll setup.'); // Changed from warn to log
  }

  async function typeText(element, text, speed = 50) {
    if (!element || !text) return;
    
    element.textContent = '';
    element.classList.add('is-typing');
    
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    
    element.classList.remove('is-typing');
  }

  // Create ScrollTrigger for typing animation
  const mainTitleSection = document.querySelector('.sticky-content-block.main-title-sticky-content');
  if (mainTitleSection) {
    ScrollTrigger.create({
      trigger: mainTitleSection,
      start: "top center",
      once: true, // Only trigger once
      onEnter: async () => {
        for (const item of projectItemsForTyping) {
          const nameElement = item.querySelector('.project-name');
          const directorElement = item.querySelector('.project-director');
          
          if (nameElement && nameElement.dataset.originalText) {
            await typeText(nameElement, nameElement.dataset.originalText);
            // Small pause between name and director
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          if (directorElement && directorElement.dataset.originalText) {
            await typeText(directorElement, directorElement.dataset.originalText);
          }
          
          // Pause before next item
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    });
  }

  // Optional: Trigger animation when the services section is in view
  // ... existing code ...
}); 

// Removed old ScrollMagic related code that was here previously. 