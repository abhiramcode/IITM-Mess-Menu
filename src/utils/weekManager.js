import { CATEGORY_REFERENCE_DATES, MEALS } from "../api/constants";
import data from "../database/messMenu.json"; // Import Data Here

// --- Configuration ---
const WEEKS = ["A", "B", "C", "D"];
const DAYS_OF_WEEK = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const REFERENCE_WEEK = "A";

// --- localStorage Keys ---
const SETUP_COMPLETE_KEY = "isSetupComplete";
const USER_CYCLE_PREFERENCES_KEY = "userCyclePreferences";
const LAST_SEEN_CYCLE_NAME_KEY = "lastSeenCycleName";

// --- Core Utility Functions ---

export const getIndianTime = () => {
	const now = new Date();
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
	const istOffset = 330 * 60000;
	return new Date(utcTime + istOffset);
};

export const toLocalDateString = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

// --- Cycle Logic (Moved here to prevent Circular Dependency) ---

export const getCycleForDate = (targetDate) => {
	const sortedCycles = [...data.cycles].sort(
		(a, b) => new Date(a.startDate) - new Date(b.startDate),
	);
	return (
		sortedCycles
			.slice()
			.reverse()
			.find((cycle) => {
				const startDate = new Date(cycle.startDate);
				startDate.setHours(0, 0, 0, 0);
				return startDate <= targetDate;
			}) || null
	);
};

// --- App Logic Functions ---

export function isSetupComplete() {
	return localStorage.getItem(SETUP_COMPLETE_KEY) === "true";
}

export function completeSetup(initialCycleName, initialCategory) {
	setPreferenceForCycle(initialCycleName, initialCategory);
	localStorage.setItem(SETUP_COMPLETE_KEY, "true");
}

/**
 * Calculates the Week based on Date AND Category Reference Date.
 */
export function getWeekForDate(targetDate, category) {
	const WEEKS = ["A", "B", "C", "D"];

	// 1. Resolve correct category or fallback
	const categoryConfig =
		(category && CATEGORY_REFERENCE_DATES[category]) ||
		CATEGORY_REFERENCE_DATES.DEFAULT;

	if (!category || !CATEGORY_REFERENCE_DATES[category]) {
		console.warn("Invalid category passed:", category);
	}
	if (!categoryConfig) {
		console.warn("No reference config found, falling back to Week A");
		return "A";
	}

	// 2. Convert reference points into sorted array
	const checkpoints = Object.entries(categoryConfig)
		.map(([date, week]) => ({
			date: new Date(`${date}T00:00:00+05:30`),
			week,
		}))
		.sort((a, b) => a.date - b.date);

	const currentDate = new Date(targetDate);
	currentDate.setHours(0, 0, 0, 0);

	// 3. Find latest checkpoint <= targetDate
	let activeCheckpoint = null;

	for (let i = checkpoints.length - 1; i >= 0; i--) {
		if (checkpoints[i].date <= currentDate) {
			activeCheckpoint = checkpoints[i];
			break;
		}
	}

	// 4. If no checkpoint found (very old date), use earliest
	if (!activeCheckpoint) {
		activeCheckpoint = checkpoints[0];
	}

	const baseWeek = activeCheckpoint.week;

	// 5. Snap baseDate back to its Monday so week cycles always reset on Monday
	const baseDate = new Date(activeCheckpoint.date);
	const dayOfWeek = baseDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
	const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
	baseDate.setDate(baseDate.getDate() + daysToMonday);

	// 6. Calculate days difference
	const diffDays = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));

	const weeksPassed = Math.floor(diffDays / 7);

	// 7. Rotate from base week
	const baseIndex = WEEKS.indexOf(baseWeek);

	if (baseIndex === -1) {
		console.warn("Invalid base week, defaulting to A");
		return "A";
	}

	const finalIndex =
		(((baseIndex + weeksPassed) % WEEKS.length) + WEEKS.length) % WEEKS.length;

	// console.log({
	// 	category,
	// 	activeCheckpoint,
	// 	diffDays,
	// 	weeksPassed,
	// });

	return WEEKS[finalIndex];
}

/**
 * Smartly determines current week.
 * If category is passed, uses it.
 * If NOT passed, automatically fetches user preference.
 */
export function getCurrentWeek(category) {
	const todayInIndia = getIndianTime();
	// If no category passed, try to get from preferences
	const effectiveCategory = category || getUserCategory();
	return getWeekForDate(todayInIndia, effectiveCategory);
}

export const getCurrentDay = () => {
	const todayInIndia = getIndianTime();
	const dayIndex = todayInIndia.getDay();
	return DAYS_OF_WEEK[dayIndex];
};

// --- Preference Management ---

export const getCyclePreferences = () => {
	const data = localStorage.getItem(USER_CYCLE_PREFERENCES_KEY);
	try {
		return data ? JSON.parse(data) : {};
	} catch {
		return {};
	}
};

export const setCyclePreferences = (preferences) => {
	localStorage.setItem(USER_CYCLE_PREFERENCES_KEY, JSON.stringify(preferences));
};

export const getPreferenceForCycle = (cycleName) => {
	if (!cycleName) return null;
	const preferences = getCyclePreferences();
	return preferences[cycleName] || null;
};

export const setPreferenceForCycle = (cycleName, category) => {
	if (!cycleName || !category) return;
	const currentPreferences = getCyclePreferences();
	currentPreferences[cycleName] = category;
	setCyclePreferences(currentPreferences);
};

export function getUserCategory() {
	const todayInIndia = getIndianTime();
	const currentCycle = getCycleForDate(todayInIndia); // Now works correctly

	if (!currentCycle || !currentCycle.name) {
		return null;
	}

	// console.log("User category:", getPreferenceForCycle(currentCycle.name));
	return getPreferenceForCycle(currentCycle.name);
}

export function updateLastSeenCycle(cycleName) {
	if (cycleName) {
		localStorage.setItem(LAST_SEEN_CYCLE_NAME_KEY, cycleName);
	}
}

export function clearAllUserData() {
	const appKeys = [
		"userCyclePreferences",
		"isSetupComplete",
		"lastSeenCycleName",
		"theme",
	];
	appKeys.forEach((key) => localStorage.removeItem(key));
	window.location.reload();
}

export const getMealStates = () => {
	const todayInIndia = getIndianTime();
	const currentTime = todayInIndia.getHours() * 60 + todayInIndia.getMinutes();
	const mealStatuses = {};
	let nextMealFound = false;

	MEALS.forEach((meal) => {
		const [startHour, startMinute] = meal.start.split(":").map(Number);
		const [endHour, endMinute] = meal.end.split(":").map(Number);
		const startTime = startHour * 60 + startMinute;
		const endTime = endHour * 60 + endMinute;

		if (currentTime >= startTime && currentTime <= endTime) {
			mealStatuses[meal.value] = "active";
			nextMealFound = true;
		} else if (currentTime > endTime) {
			mealStatuses[meal.value] = "past";
		} else {
			mealStatuses[meal.value] = "future";
		}
	});

	if (!nextMealFound) {
		for (const meal of MEALS) {
			if (mealStatuses[meal.value] === "future") {
				mealStatuses[meal.value] = "active";
				break;
			}
		}
	}
	return mealStatuses;
};
