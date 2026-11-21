let deferredPrompt = null;
const listeners = new Set();

const emit = () => {
	for (const listener of listeners) {
		listener();
	}
};

// Register at module load so we do not miss beforeinstallprompt when the
// install UI is rendered from a lazily-loaded route.
if (typeof window !== "undefined") {
	window.addEventListener("beforeinstallprompt", (event) => {
		event.preventDefault();
		deferredPrompt = event;
		emit();
	});

	window.addEventListener("appinstalled", () => {
		deferredPrompt = null;
		emit();
	});
}

export const getDeferredPwaPrompt = () => deferredPrompt;

export const clearDeferredPwaPrompt = () => {
	deferredPrompt = null;
	emit();
};

export const subscribeToPwaInstall = (listener) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};
