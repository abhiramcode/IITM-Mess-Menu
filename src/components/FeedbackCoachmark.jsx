import React, { useState, useEffect } from 'react';
import { X, MessageSquareHeart } from 'lucide-react';

export default function FeedbackCoachmark({ isMenuExpanded }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the coachmark
    const hasSeenPopup = localStorage.getItem('hasSeenFeedbackCoachmark');
    
    if (!hasSeenPopup) {
      // Show the popup after a brief delay so the page loads first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); 

      return () => clearTimeout(timer);
    }
  }, []);

  // If the user expands the menu, we can automatically hide the coachmark
  useEffect(() => {
    if (isMenuExpanded && isVisible) {
      handleClose();
    }
  }, [isMenuExpanded]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenFeedbackCoachmark', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-[50%] right-0 mb-4 w-64 bg-bg border border-border p-4 rounded-2xl shadow-2xl animate-fade-in-up z-50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <MessageSquareHeart size={18} />
            <span className="font-semibold text-sm">Share Feedback!</span>
          </div>
          <p className="text-muted text-xs leading-relaxed m-0">
            Got suggestions or feedback? Click here to share your feedback anonymously.
          </p>
        </div>
        <button 
          onClick={handleClose} 
          className="text-muted hover:text-fg transition-colors p-1 -mt-1 -mr-1"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Downward pointer arrow */}
      <div className="absolute -bottom-2 right-4 w-4 h-4 bg-bg border-b border-r border-border transform rotate-45"></div>
    </div>
  );
}
