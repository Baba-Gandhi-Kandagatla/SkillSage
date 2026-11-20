import exp from "constants";

export const handleVisibilityChange = (e: Event, onViolation: () => void) => {
    if (document.hidden) {
        e.preventDefault();
        onViolation(); // Call the provided function on violation
        // Force focus back to window
        window.focus();
        // Force to foreground
        // window.location.href = window.location.href ;
    return false;
    }
};


export const handleKeyDown = (e: KeyboardEvent, handleViolation:()=> void) => {
    // Prevent all tab-related shortcuts
    if (
    //   e.key === 'Tab' || 
    //   (e.altKey && e.key === 'Tab') || 
    //   (e.ctrlKey && e.key === 'Tab') ||
      (e.metaKey && e.key === '`') || // Command + ` (backtick) on Mac
      (e.altKey && e.key === '`')   // Alt + ` on Windows
    ) {
      e.preventDefault();
      e.stopPropagation();
      handleViolation();
      return false;
    }
    
    // Block Alt key completely
    // if (e.key === 'Alt' || e.altKey) {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   handleViolation();
    //   return false;
    // }

    // Prevent Escape key entirely
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      handleViolation();
      return false;
    }
    
    // Block all Alt combinations
    if (e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      handleViolation();
      return false;
    }

    // Prevent Ctrl/Cmd + R
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleViolation();
    }

    // // Prevent Alt + Tab
    // if (e.key === 'Tab' && e.altKey) {
    //   e.preventDefault();
    //   handleViolation();
    // }

    // Prevent F11
    if (e.key === 'F11') {
      e.preventDefault();
      handleViolation();
    }

    // Prevent Windows/Command key
    // if (e.key === 'Meta' || e.key === 'OS') {
    //   e.preventDefault();
    //   handleViolation();
    // }
  };

export const handleBlur = () => {
    setTimeout(() => {
      window.focus();
    }, 0);
  };


export const handleBlurOld = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

