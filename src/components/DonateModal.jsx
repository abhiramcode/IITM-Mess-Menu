import React from "react";
import { Heart, X } from "lucide-react";

/**
 * A modal to prompt the user for contributions or donations.
 */
const DonateModal = ({ isOpen, onClose }) => {
	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
			onClick={onClose}
		>
			<div 
				className="bg-bg border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 relative flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-6 border-b border-border flex-shrink-0">
					<button
						onClick={onClose}
						className="absolute top-3 right-3 text-muted hover:text-fg transition-colors"
					>
						<X size={24} />
					</button>
					<h2 className="text-2xl font-bold text-fg m-0 flex items-center gap-2">
						<Heart className="text-red-500 fill-red-500" size={24} />
						Support Our Work
					</h2>
				</div>

				<div className="p-6 space-y-4">
					<p className="text-fg leading-relaxed">
						If you find this website helpful, please consider contributing! 
						Your support helps us keep the menu up-to-date in real-time, 
						and build new features for the community.
					</p>
					<p className="text-sm text-muted">
						Every contribution, no matter how small, makes a huge difference. Thank you for your support!
					</p>
				</div>

				<div className="p-6 border-t border-border flex-shrink-0">
					<a
						href="#" // TODO: Replace with your actual payment/contribution link
						onClick={(e) => { // Remove this when you have a payment link
							e.preventDefault();
							// Do nothing else here
						}}
						target="_blank"
						rel="noopener noreferrer"
						className="btn-primary w-full flex justify-center items-center gap-2"
					>
						<Heart size={20} />
						Contribute Now
					</a>
				</div>
			</div>
		</div>
	);
};

export default DonateModal;
