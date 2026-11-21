import React, { useMemo, useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";

import { getContextForDate } from "../features/mess-menu/api/menuApi";
import {
	completeSetup,
	getPreferenceForCycle,
	isSetupComplete,
	setPreferenceForCycle,
	updateLastSeenCycle,
} from "../features/mess-menu/utils/weekManager";

import MenuExplorer from "../features/mess-menu/components/MenuExplorer";
import SetupModal from "../features/mess-menu/components/SetupModal";
import TodaysMenu from "../features/mess-menu/components/TodaysMenu";
import PwaInstallButton from "../components/ui/PwaInstallButton";

/**
 * The Home Page — the main Mess Menu experience.
 * Handles cycle detection, onboarding, and renders TodaysMenu + MenuExplorer.
 */
const HomePage = ({ onOpenSettings, onOpenFeedback }) => {
	const [modalToShow, setModalToShow] = useState(null); // 'initialSetup', 'newCyclePrompt', 'confirmNewCycle'
	const [prefilledPreference, setPrefilledPreference] = useState(null);

	const skeletonThemeLight = {
		baseColor: "#f9fafb",
		highlightColor: "#e5e7eb",
	};
	const skeletonThemeDark = { baseColor: "#1f2937", highlightColor: "#374151" };

	// This effect runs once on startup to determine if a modal should be shown.
	useMemo(() => {
		const setupDone = isSetupComplete();
		if (!setupDone) {
			setModalToShow("initialSetup");
			return;
		}

		const todayContext = getContextForDate(new Date());
		const lastSeenCycle = localStorage.getItem("lastSeenCycleName");
		const currentCycleName = todayContext?.cycleName;

		if (currentCycleName && currentCycleName !== lastSeenCycle) {
			const preferenceForNewCycle = getPreferenceForCycle(currentCycleName);

			if (preferenceForNewCycle) {
				// A preference exists for the new cycle, so show the confirmation prompt.
				setModalToShow("confirmNewCycle");
				setPrefilledPreference(preferenceForNewCycle);
			} else {
				// No preference exists, show the standard "new cycle" prompt.
				setModalToShow("newCyclePrompt");
			}
		}
	}, []);

	const handleOnboardingSave = (cycleName, category) => {
		// For initial setup, we also need to set the completion flag.
		if (modalToShow === "initialSetup") {
			completeSetup(cycleName, category);
		}

		// For all onboarding flows, we save the preference and update the "last seen" stamp.
		setPreferenceForCycle(cycleName, category);
		updateLastSeenCycle(cycleName);

		setModalToShow(null);
		window.location.reload();
	};

	return (
		<SkeletonTheme
			{...(document.documentElement.classList.contains("dark")
				? skeletonThemeDark
				: skeletonThemeLight)}
		>
			{(modalToShow === "initialSetup" ||
				modalToShow === "newCyclePrompt" ||
				modalToShow === "confirmNewCycle") && (
					<SetupModal
						onSave={handleOnboardingSave}
						context={modalToShow}
						prefilledPreference={prefilledPreference}
					/>
				)}

			{isSetupComplete() ? (
				<>
					<TodaysMenu
						onOpenSettings={onOpenSettings}
						onOpenFeedback={onOpenFeedback}
					/>
					<PwaInstallButton />
					<div className="w-full max-w-7xl mx-auto px-4">
						<div className="border-t border-border my-4 sm:my-10"></div>
					</div>
					<MenuExplorer />
				</>
			) : (
				<div className="text-center py-20 text-muted">
					<p>Please complete the initial setup to view the menu.</p>
				</div>
			)}
		</SkeletonTheme>
	);
};

export default HomePage;
