import { lazy, Suspense, useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import AppRouter from "./router/AppRouter";

// Global Shared Components
import FloatingMenu from "./components/navigation/FloatingMenu";
import UpdatePrompt from "./components/ui/UpdatePrompt";
import { MigrationApp } from "./features/mess-menu/components/MigrationApp";

// Modals are loaded only when the user opens them. This keeps the menu data and
// modal-only dependencies out of the initial app shell.
const SettingsModal = lazy(
	() => import("./features/mess-menu/components/SettingsModal"),
);
const DonateModal = lazy(() => import("./components/modals/DonateModal"));
const FeedbackModal = lazy(() => import("./components/modals/FeedbackModal"));
const ConnectedAppsCarousel = lazy(
	() => import("./components/navigation/ConnectedAppsCarousel"),
);

export default function App() {
	const [modalToShow, setModalToShow] = useState(null);
	const [hasOpenedConnectedApps, setHasOpenedConnectedApps] = useState(false);

	// Feature Flags for Floating Menu
	const ENABLE_FLOATING_MENU = true;
	const SHOW_DONATE_BUTTON = false;
	const SHOW_FEEDBACK_BUTTON = true;
	const SHOW_CONNECTED_APPS = true;

	const openSettingsModal = () => setModalToShow("settings");
	const openDonateModal = () => setModalToShow("donate");
	const openFeedbackModal = () => setModalToShow("feedback");
	const openConnectedAppsModal = () => {
		setHasOpenedConnectedApps(true);
		setModalToShow("connectedApps");
	};
	const closeAllModals = () => setModalToShow(null);

	// --- The Domain Check ---
	const oldHostname = "iitm-mess-menu.vercel.app";

	// If the app is running on the old domain, render the special migration component.
	if (window.location.hostname === oldHostname) {
		return <MigrationApp />;
	}

	return (
		<ThemeProvider>
			{/* Global Modals */}
			<Suspense fallback={null}>
				{modalToShow === "settings" && (
					<SettingsModal isOpen={true} onClose={closeAllModals} />
				)}
				{modalToShow === "donate" && (
					<DonateModal isOpen={true} onClose={closeAllModals} />
				)}
				{modalToShow === "feedback" && (
					<FeedbackModal isOpen={true} onClose={closeAllModals} />
				)}
				{hasOpenedConnectedApps && (
					<ConnectedAppsCarousel
						isOpen={modalToShow === "connectedApps"}
						onClose={closeAllModals}
					/>
				)}
			</Suspense>

			{/* Router Views */}
			<AppRouter
				onOpenSettings={openSettingsModal}
				onOpenFeedback={openFeedbackModal}
			/>

			{/* Global Floating Action Bar */}
			<FloatingMenu
				onOpenDonate={openDonateModal}
				onOpenFeedback={openFeedbackModal}
				onOpenConnectedApps={openConnectedAppsModal}
				showMenu={ENABLE_FLOATING_MENU}
				showDonate={SHOW_DONATE_BUTTON}
				showFeedback={SHOW_FEEDBACK_BUTTON}
				showConnectedApps={SHOW_CONNECTED_APPS}
			/>

			<UpdatePrompt />
		</ThemeProvider>
	);
}
