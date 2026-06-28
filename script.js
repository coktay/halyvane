/**
 * Halyvane - Clean, Modern & Responsive JavaScript
 * Interactions: Mobile menu toggle, Header scroll effect, Smooth scrolling behavior helper
 */

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('navigation-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.getElementById('site-header');

  // 1. Mobile Menu Toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Prevent body scrolling when mobile menu is open
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  // 2. Close mobile menu when a nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // 3. Header Scroll Effect (adds shadow/opacity adjustment on scroll)
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = 'var(--shadow-md)';
      header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
      header.style.boxShadow = 'none';
      header.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Run once on load in case page is loaded mid-scroll
  handleScroll();
});
