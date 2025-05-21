/**
 * Login Popup JS
 * Handles auto-opening the login popup and form toggling
 */
// Use requestIdleCallback to defer initialization until browser is idle
// This ensures the main thread is free for critical rendering work
(function() {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(init, {timeout: 5000}); // idle or 5s max
  } else {
    // Fallback for browsers without requestIdleCallback (Safari, older browsers)
    setTimeout(init, 3000); // ~after First Contentful Paint
  }
  
  function init() {
    // Main initialization function - runs when browser is idle
    
    // Get values from global variables set in the section
    var modalId = window.loginPopupId || ''; 
    var delaySeconds = window.loginPopupDelay || 3;
    
    // Enforce a minimum delay of 3 seconds to avoid Google penalties
    delaySeconds = Math.max(delaySeconds, 3);
    
    // If no modal ID is found, exit early
    if (!modalId) return;

    // Skip in theme editor or for logged-in customers
    if (typeof Shopify !== 'undefined' && Shopify.designMode) return;

    // Track event listeners for cleanup
    var eventListeners = [];
    var loginModal = null;
    
    // Helper to safely add event listeners with tracking for cleanup
    function addTrackedEventListener(element, eventType, handler) {
      if (!element) return;
      
      element.addEventListener(eventType, handler);
      eventListeners.push({
        element: element,
        eventType: eventType,
        handler: handler
      });
    }
    
    // Cleanup all tracked event listeners
    function cleanupEventListeners() {
      eventListeners.forEach(function(listener) {
        if (listener.element) {
          listener.element.removeEventListener(listener.eventType, listener.handler);
        }
      });
      eventListeners = [];
    }

    function showModal() {
      if (typeof theme === 'undefined' || typeof theme.Modals === 'undefined') {
        return false; // theme JS not ready yet
      }

      // Clean up existing modal instance if it exists
      if (loginModal) {
        loginModal = null;
        cleanupEventListeners();
      }
      
      loginModal = new theme.Modals(modalId, 'login-popup-modal');
      
      // Setup cleanup when modal closes
      var modalElement = document.getElementById(modalId);
      if (modalElement) {
        addTrackedEventListener(modalElement, 'modal:closed', function() {
          cleanupEventListeners();
          loginModal = null;
        });
      }
      
      setTimeout(function() {
        loginModal.open();
        // Lazy attach event listeners only after modal is visible
        // This ensures we don't create any handlers until they're needed
        attachToggleListeners();
      }, delaySeconds * 1000);

      return true;
    }

    function run() {
      var showModalSuccess = showModal();
      
      if (!showModalSuccess) {
        var loadHandler = function() {
          showModal();
          window.removeEventListener('load', loadHandler);
        };
        addTrackedEventListener(window, 'load', loadHandler);
      }
    }

    // --- Form toggling logic ---
    function toggleRecoverPasswordForm() {
      var loginForm = document.getElementById('CustomerLoginForm');
      var recoverForm = document.getElementById('RecoverPasswordForm');
      // Ensure both forms exist within this specific modal instance before toggling
      var modalContainer = document.getElementById(modalId); 
      if (modalContainer && loginForm && recoverForm && modalContainer.contains(loginForm) && modalContainer.contains(recoverForm)) {
        loginForm.classList.toggle('hide');
        recoverForm.classList.toggle('hide');
      }
    }

    // Attach listeners after DOM is ready
    function attachToggleListeners() {
      // Find links specifically within this modal instance
      var modalContainer = document.getElementById(modalId);
      if (!modalContainer) return; 

      var recoverLink = modalContainer.querySelector('#RecoverPassword');
      var cancelLink = modalContainer.querySelector('#HideRecoverPasswordLink');

      // Add tracked event listeners for proper cleanup
      var recoverHandler = function(evt) {
        evt.preventDefault();
        toggleRecoverPasswordForm();
      };
      
      var cancelHandler = function(evt) {
        evt.preventDefault();
        toggleRecoverPasswordForm();
      };
      
      addTrackedEventListener(recoverLink, 'click', recoverHandler);
      addTrackedEventListener(cancelLink, 'click', cancelHandler);
    }

    // Initialize everything when the DOM is fully loaded
    if (document.readyState !== 'loading') {
      run();
    } else {
      var domReadyHandler = function() {
        run();
        document.removeEventListener('DOMContentLoaded', domReadyHandler);
      };
      document.addEventListener('DOMContentLoaded', domReadyHandler);
    }
    
    // Clean up on page unload to prevent memory leaks in single-page applications
    window.addEventListener('beforeunload', cleanupEventListeners);
  } // End of init function
})(); 