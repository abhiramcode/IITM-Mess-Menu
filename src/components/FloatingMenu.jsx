import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageSquare, Menu, X } from "lucide-react";

const FloatingMenu = ({ 
    onOpenDonate, 
    onOpenFeedback, 
    showMenu = true,
    showDonate = true,
    showFeedback = true 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isExpanded]);

    if (!showMenu) return null;

    return (
        <div ref={menuRef} className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-40">
            {/* Feedback Button */}
            {showFeedback && (
                <div 
                    className={`transition-all duration-300 transform ${isExpanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-50 pointer-events-none'} flex flex-col items-center gap-2`}
                >
                    <button
                        onClick={() => { setIsExpanded(false); onOpenFeedback(); }}
                        className="p-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-transform"
                        aria-label="Give Feedback"
                        title="Give Feedback"
                    >
                        <MessageSquare size={20} />
                    </button>
                </div>
            )}

            {/* Donate Button */}
            {showDonate && (
                <div 
                    className={`transition-all duration-300 transform ${isExpanded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-50 pointer-events-none'} flex flex-col items-center gap-2`}
                >
                    <button
                        onClick={() => { setIsExpanded(false); onOpenDonate(); }}
                        className="p-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-transform"
                        aria-label="Support Us"
                        title="Support Us"
                    >
                        <Heart size={20} fill="currentColor" />
                    </button>
                </div>
            )}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 bg-primary text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50 group"
                aria-label="Open Menu"
            >
                {isExpanded ? (
                    <X size={20} className="animate-in fade-in zoom-in duration-300" />
                ) : (
                    <Menu size={20} className="animate-in fade-in zoom-in duration-300 group-hover:animate-pulse" />
                )}
            </button>
        </div>
    );
};

export default FloatingMenu;
