import React, { useEffect, useRef, useState } from "react";
import { Check, Settings, Share2 } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { APP_NAME } from "../../features/mess-menu/api/constants";

const SHARE_TEXT = "Look what's in the menu today";

const copyText = async (text) => {
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Fall through to the legacy copy path. This is also used on HTTP
			// LAN URLs, where the Clipboard API is unavailable.
		}
	}

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.setAttribute("readonly", "");
	textarea.style.position = "fixed";
	textarea.style.top = "-9999px";
	document.body.appendChild(textarea);
	textarea.select();

	try {
		return document.execCommand("copy");
	} catch {
		return false;
	} finally {
		document.body.removeChild(textarea);
	}
};

const Navbar = ({ onOpenSettings }) => {
	const [isCopied, setIsCopied] = useState(false);
	const copyResetTimer = useRef(null);

	useEffect(() => {
		return () => {
			if (copyResetTimer.current) {
				clearTimeout(copyResetTimer.current);
			}
		};
	}, []);

	const handleShare = async () => {
		const url = window.location.origin;
		const shareData = {
			title: APP_NAME,
			text: SHARE_TEXT,
			url,
		};

		if (typeof navigator.share === "function") {
			try {
				await navigator.share(shareData);
				return;
			} catch (error) {
				// The user cancelled the native share sheet; do nothing.
				if (error.name === "AbortError") return;
				console.error("Native share failed:", error);
			}
		}

		try {
			const copied = await copyText(`${SHARE_TEXT}\n${url}`);
			if (!copied) {
				// Last resort for insecure LAN URLs where both the Share and
				// Clipboard APIs are unavailable.
				window.prompt("Copy this link to share:", `${SHARE_TEXT}\n${url}`);
				return;
			}

			setIsCopied(true);
			if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
			copyResetTimer.current = setTimeout(() => setIsCopied(false), 2000);
		} catch (error) {
			console.error("Could not copy the share link:", error);
		}
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur-md">
			<div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
				{/* Left side: Logo */}
				<div className="flex items-center gap-2">
					<img src="/logo.svg" alt="IITM Mess Logo" className="h-8 w-8" />
					<span className="text-xl font-bold text-fg">{APP_NAME}</span>
				</div>

				{/* Right side: Icons */}
				<div className="flex items-center gap-2">
					<button
						onClick={handleShare}
						className="p-2 rounded-full text-muted transition-colors hover:text-fg hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						aria-label={isCopied ? "Link copied" : "Share DigiMess"}
						title={isCopied ? "Link copied" : "Share"}
					>
						{isCopied ? <Check size={20} /> : <Share2 size={20} />}
					</button>
					<ThemeToggle />
					<button
						onClick={onOpenSettings}
						className="p-2 rounded-full text-muted transition-colors hover:text-fg hover:bg-input-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						aria-label="Open settings"
					>
						<Settings size={20} />
					</button>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
