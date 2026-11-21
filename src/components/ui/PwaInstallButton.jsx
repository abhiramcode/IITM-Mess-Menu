import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
	clearDeferredPwaPrompt,
	getDeferredPwaPrompt,
	subscribeToPwaInstall,
} from "../../lib/pwaInstall";

const DISPLAY_MODE_QUERIES = [
	"(display-mode: standalone)",
	"(display-mode: fullscreen)",
	"(display-mode: minimal-ui)",
];

const isRunningAsPwa = () => {
	if (typeof window === "undefined") return false;
	if (window.navigator.standalone === true) return true;
	if (typeof window.matchMedia !== "function") return false;

	return DISPLAY_MODE_QUERIES.some((query) =>
		window.matchMedia(query).matches,
	);
};

/**
 * Shows an install action only when the browser supports the install prompt
 * and the app is not already running as an installed PWA.
 */
const PwaInstallButton = () => {
	const [isPwa, setIsPwa] = useState(isRunningAsPwa);
	const [canInstall, setCanInstall] = useState(() =>
		Boolean(getDeferredPwaPrompt()),
	);

	useEffect(() => {
		const update = () => {
			setIsPwa(isRunningAsPwa());
			setCanInstall(Boolean(getDeferredPwaPrompt()));
		};

		update();
		const unsubscribe = subscribeToPwaInstall(update);

		const mediaQueries =
			typeof window.matchMedia === "function"
				? DISPLAY_MODE_QUERIES.map((query) => window.matchMedia(query))
				: [];

		for (const mediaQuery of mediaQueries) {
			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener("change", update);
			} else {
				mediaQuery.addListener(update);
			}
		}

		return () => {
			unsubscribe();
			for (const mediaQuery of mediaQueries) {
				if (mediaQuery.removeEventListener) {
					mediaQuery.removeEventListener("change", update);
				} else {
					mediaQuery.removeListener(update);
				}
			}
		};
	}, []);

	if (isPwa || !canInstall) return null;

	const handleInstall = async () => {
		const promptEvent = getDeferredPwaPrompt();
		if (!promptEvent) {
			setCanInstall(false);
			return;
		}

		try {
			await promptEvent.prompt();
			await promptEvent.userChoice;
		} catch (error) {
			console.error("PWA install prompt failed:", error);
		} finally {
			clearDeferredPwaPrompt();
			setCanInstall(false);
		}
	};

	return (
		<section className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-6">
			<div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-3 rounded-xl border border-border bg-input-bg/60 px-5 py-4 text-center shadow-sm">
				<div>
					{/* <p className="font-semibold text-fg m-0">Install DigiMess</p> */}
					<p className="text-sm text-muted m-0 mt-1">
						Add it to your home screen for quick, offline-ready access.
					</p>
				</div>
				<button
					type="button"
					onClick={handleInstall}
					className="btn-primary inline-flex items-center gap-2"
					aria-label="Install DigiMess as an app"
				>
					<Download size={16} />
					Add to Homescreen
				</button>
			</div>
		</section>
	);
};

export default PwaInstallButton;
