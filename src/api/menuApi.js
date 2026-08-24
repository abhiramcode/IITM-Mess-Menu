import data from "../database/messMenu.json";
import {
	getCurrentDay,
	getCurrentWeek,
	getCycleForDate,
	getIndianTime,
	getUserCategory,
	getWeekForDate,
	toLocalDateString,
} from "../utils/weekManager";
import ApiResponse from "./ApiResponse";
import { CATEGORY_REFERENCE_DATES, MENUS } from "./constants";

const deepMerge = (base, override) => {
	const merged = { ...base };
	for (const key in override) {
		if (Object.prototype.hasOwnProperty.call(override, key)) {
			if (
				Object.prototype.hasOwnProperty.call(merged, key) &&
				typeof merged[key] === "object" &&
				!Array.isArray(merged[key]) &&
				merged[key] !== null &&
				typeof override[key] === "object" &&
				!Array.isArray(override[key]) &&
				override[key] !== null
			) {
				merged[key] = deepMerge(merged[key], override[key]);
			} else {
				merged[key] = override[key];
			}
		}
	}
	return merged;
};

const getMenuContentForDate = (date) => {
	const targetDate = new Date(date);
	targetDate.setHours(0, 0, 0, 0);

	const versionDates = Object.keys(data.versions).map((d) => new Date(d));
	const overrideDates = Object.keys(data.overrides || {}).map(
		(d) => new Date(d),
	);

	const applicableDates = [...versionDates, ...overrideDates]
		.filter((d) => {
			const checkDate = new Date(d);
			checkDate.setHours(0, 0, 0, 0);
			return checkDate <= targetDate;
		})
		.sort((a, b) => a - b);

	if (applicableDates.length === 0) return null;

	let baseVersionKey = null;
	for (let i = applicableDates.length - 1; i >= 0; i--) {
		const dateKey = toLocalDateString(applicableDates[i]);
		if (data.versions[dateKey]) {
			baseVersionKey = dateKey;
			break;
		}
	}

	if (!baseVersionKey) return null;

	let finalMenuContent = JSON.parse(
		JSON.stringify(data.versions[baseVersionKey].Messmenu.Categories),
	);
	const baseVersionDate = new Date(baseVersionKey);
	baseVersionDate.setHours(0, 0, 0, 0);

	const applicableOverrides = applicableDates.filter((d) => {
		const overrideDate = new Date(d);
		overrideDate.setHours(0, 0, 0, 0);
		const dateKey = toLocalDateString(overrideDate);
		return (data.overrides || {})[dateKey] && overrideDate >= baseVersionDate;
	});

	for (const overrideDate of applicableOverrides) {
		const overrideKey = toLocalDateString(overrideDate);
		finalMenuContent = deepMerge(finalMenuContent, data.overrides[overrideKey]);
	}

	return {
		menuContent: finalMenuContent,
		versionId: baseVersionKey,
	};
};

export const getContextForDate = (date) => {
	const cycle = getCycleForDate(date);
	const baseMenuData = getMenuContentForDate(new Date(date));

	if (!baseMenuData) return null;

	let { menuContent, versionId } = baseMenuData;

	const activeEvent = (data.eventOverrides || []).find((event) => {
		const startDate = new Date(event.startDate);
		const endDate = new Date(event.endDate);
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);
		return date >= startDate && date <= endDate;
	});

	let eventName = null;
	let eventDescription = null;

	if (activeEvent) {
		eventName = activeEvent.eventName;
		const dateString = toLocalDateString(date);
		const activeRules = activeEvent.rules.filter(
			(rule) => rule.onDate === dateString,
		);

		if (activeRules.length > 0) {
			const baseMenuSnapshot = JSON.parse(JSON.stringify(menuContent));
			const dayOfWeek = date.toLocaleString("en-US", { weekday: "long" });
			let descriptions = [];

			for (const rule of activeRules) {
				// --- 1. REMAP LOGIC ---
				if (rule.type === "remap" && rule.targetMeal && rule.sourceDay) {
					const { targetMeal, sourceDay } = rule;

					for (const catKey in menuContent) {
						const currentCategoryWeek = getWeekForDate(date, catKey);

						const sourceMenu =
							baseMenuSnapshot[catKey]?.[currentCategoryWeek]?.schedule?.[
								sourceDay
							]?.[targetMeal];

						if (sourceMenu) {
							if (!menuContent[catKey][currentCategoryWeek])
								menuContent[catKey][currentCategoryWeek] = { schedule: {} };

							if (!menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek])
								menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek] =
									{};

							menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek][
								targetMeal
							] = sourceMenu;
						}
					}
				}

				// --- 2. OVERRIDE LOGIC ---
				else if (rule.type === "override" && rule.targetMeal && rule.items) {
					const { targetMeal, items } = rule;
					const globalItems = items["All_Categories"];

					const categoriesToProcess = globalItems
						? Object.keys(menuContent)
						: Object.keys(items);

					for (const catKey of categoriesToProcess) {
						if (Object.prototype.hasOwnProperty.call(menuContent, catKey)) {
							const currentCategoryWeek = getWeekForDate(date, catKey);

							const foodList = items[catKey] || globalItems;

							if (foodList) {
								if (!menuContent[catKey][currentCategoryWeek])
									menuContent[catKey][currentCategoryWeek] = { schedule: {} };

								if (
									!menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek]
								)
									menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek] =
										{};

								menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek][
									targetMeal
								] = foodList;
							}
						}
					}
				}

				// --- 3. ADDON LOGIC ---
				else if (rule.type === "addon" && rule.targetMeal && rule.items) {
					const { targetMeal, items } = rule;
					const globalItems = items["All_Categories"];

					const categoriesToProcess = globalItems
						? Object.keys(menuContent)
						: Object.keys(items);

					for (const catKey of categoriesToProcess) {
						if (Object.prototype.hasOwnProperty.call(menuContent, catKey)) {
							const currentCategoryWeek = getWeekForDate(date, catKey);

							const itemsToAdd = items[catKey] || globalItems;

							if (itemsToAdd) {
								if (!menuContent[catKey][currentCategoryWeek])
									menuContent[catKey][currentCategoryWeek] = { schedule: {} };

								if (
									!menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek]
								)
									menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek] =
										{};

								const currentItems =
									menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek][
										targetMeal
									] || [];

								menuContent[catKey][currentCategoryWeek].schedule[dayOfWeek][
									targetMeal
								] = [...currentItems, ...itemsToAdd];
							}
						}
					}
				}

				if (rule.description) {
					descriptions.push(rule.description);
				}
			}

			if (descriptions.length > 0) {
				eventDescription = descriptions.join(" ");
			}
		}

		if (eventName && !eventDescription && activeEvent.description) {
			eventDescription = activeEvent.description;
		}
	}

	const availableCategoryKeys = Object.keys(menuContent);
	const availableCategories = MENUS.filter((menu) =>
		availableCategoryKeys.includes(menu.value),
	);

	return {
		cycleName: cycle ? cycle.name : "No active cycle",
		versionId: versionId,
		eventName: eventName,
		eventDescription: eventDescription,
		menuContent: menuContent,
		availableCategories: availableCategories,
	};
};
export const getContextForCycle = (cycle) => {
	if (!cycle) return null;
	const context = getMenuContentForDate(new Date(cycle.endDate));
	if (!context) return null;

	const { menuContent, versionId } = context;
	const availableCategoryKeys = Object.keys(menuContent);
	const availableCategories = MENUS.filter((menu) =>
		availableCategoryKeys.includes(menu.value),
	);

	return {
		cycleName: cycle.name,
		versionId: versionId,
		menuContent: menuContent,
		availableCategories: availableCategories,
	};
};

export const getAllCycles = () => {
	return data.cycles.map((cycle) => ({
		value: cycle.startDate,
		label: cycle.name,
	}));
};

export const getAvailableCategoriesForCurrentVersion = () => {
	const todayInIndia = getIndianTime();
	const context = getContextForDate(todayInIndia);
	return context ? context.availableCategories : [];
};

export const getTodaysMenu = async () => {
	try {
		const category = getUserCategory();

		if (!CATEGORY_REFERENCE_DATES[category]) {
			console.warn("Invalid category, falling back to DEFAULT:", category);
		}

		// console.log("==== DEBUG TODAY MENU ====");
		// console.log("Category:", category);
		// console.log("Week from logic:", week);
		// console.log("Available weeks:", Object.keys(categoryData));
		// console.log("Full categoryData:", categoryData);
		// Fetch week using category to determine if Protein Phase Shift applies
		const week = getCurrentWeek(category);
		const day = getCurrentDay();

		// console.log("Selected weekData:", weekData);
		// console.log("Day:", day);
		// console.log("Day menu:", weekData?.schedule?.[day]);

		// console.log("Resolved Week:", {
		// 	category,
		// 	week,
		// 	date: getIndianTime(),
		// });

		if (!category || !week || !day) {
			throw new Error("User context is not fully set up.");
		}

		const todayInIndia = getIndianTime();
		const context = getContextForDate(todayInIndia);
		if (!context) {
			throw new Error("Could not load menu context for today.");
		}

		const menuData = context.menuContent;
		const categoryData = menuData[category];
		if (!categoryData) {
			throw new Error(
				`Your preferred mess "${category}" is not available in the current menu.`,
			);
		}

		const weekData = categoryData[week];
		const dayMenu = weekData?.schedule?.[day];

		if (!dayMenu) {
			return new ApiResponse(
				200,
				"Menu retrieved, but no items for this meal.",
				{},
			);
		}

		const commonItems = categoryData.common_items || {};
		const finalMenu = {
			Breakfast: dayMenu.Breakfast || [],
			Lunch: dayMenu.Lunch || [],
			Snacks: dayMenu.Snacks || [],
			Dinner: dayMenu.Dinner || [],
			common: {
				Breakfast: commonItems.Breakfast || "",
				Lunch: commonItems.Lunch || "",
				Snacks: commonItems.Snacks || "",
				Dinner: commonItems.Dinner || "",
			},
			meta: {
				eventName: context.eventName || null,
				eventDescription: context.eventDescription || null,
				isEventActive: !!context.eventName,
			},
		};

		return new ApiResponse(
			200,
			"Today's menu retrieved successfully",
			finalMenu,
		);
	} catch (error) {
		return new ApiResponse(500, error.message, null);
	}
};

/**
 * Finds the current cycle and its immediate previous and next neighbors.
 */
export const getNeighboringCycles = () => {
	const sortedCycles = [...data.cycles].sort(
		(a, b) => new Date(a.startDate) - new Date(b.startDate),
	);
	const today = getIndianTime();
	today.setHours(0, 0, 0, 0);

	const trueCurrentIndex = sortedCycles.findIndex((cycle) => {
		const startDate = new Date(cycle.startDate);
		const endDate = new Date(cycle.endDate);
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);
		return today >= startDate && today <= endDate;
	});

	if (trueCurrentIndex !== -1) {
		return {
			previous: sortedCycles[trueCurrentIndex - 1] || null,
			current: sortedCycles[trueCurrentIndex],
			next: sortedCycles[trueCurrentIndex + 1] || null,
		};
	} else {
		const nextUpcomingIndex = sortedCycles.findIndex(
			(cycle) => new Date(cycle.startDate) > today,
		);

		if (nextUpcomingIndex !== -1) {
			return {
				previous: sortedCycles[nextUpcomingIndex - 1] || null,
				current: sortedCycles[nextUpcomingIndex],
				next: sortedCycles[nextUpcomingIndex + 1] || null,
			};
		} else {
			const lastIndex = sortedCycles.length - 1;
			return {
				previous: sortedCycles[lastIndex - 1] || null,
				current: sortedCycles[lastIndex] || null,
				next: null,
			};
		}
	}
};

export const getCalendarDateRange = () => {
	const { previous, current, next } = getNeighboringCycles();

	if (!current) {
		return null;
	}

	const minDate = new Date(previous ? previous.startDate : current.startDate);
	const maxDate = new Date(next ? next.endDate : current.endDate);

	return { minDate, maxDate };
};
