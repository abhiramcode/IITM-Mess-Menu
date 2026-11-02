import React, { useState, useEffect, useRef, useMemo } from "react";
import {
	format,
	addDays,
	subDays,
	isBefore,
	isAfter,
	startOfDay,
	endOfDay,
} from "date-fns";
import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	Settings,
	Sparkles,
	RotateCcw,
	UtensilsCrossed,
} from "lucide-react";

import { MENUS, CUISINE_DIET_MAPPING } from "../api/constants";
import { getContextForDate, getCalendarDateRange } from "../api/menuApi";
import {
	getCurrentWeek,
	getPreferenceForCycle,
	getWeekForDate,
	getMealStates,
} from "../utils/weekManager";
import CalendarModal from "./CalendarModal";
import MealCard from "./MealCard";
import TodaysMenuSkeleton from "./skeletons/TodaysMenuSkeleton";
import EventDescription from "./EventDescription";

const CUISINES = [
	{ key: "South", label: "South Indian", short: "S" },
	{ key: "North", label: "North Indian", short: "N" },
	{ key: "Unified", label: "Unified", short: "U" },
	{ key: "Protein", label: "Protein", short: "P" },
];

const DIETS = [
	{ key: "Pureveg", label: "Pure Veg" },
	{ key: "Veg", label: "Veg" },
	{ key: "Nonveg", label: "Non-Veg" },
];

const parseCategory = (category) => {
	if (!category) return { cuisine: "South", diet: "Veg" };
	for (const [cuisineKey, dietMap] of Object.entries(CUISINE_DIET_MAPPING)) {
		for (const [dietKey, catValue] of Object.entries(dietMap)) {
			if (catValue === category) {
				return { cuisine: cuisineKey, diet: dietKey };
			}
		}
	}
	return { cuisine: "South", diet: "Veg" };
};

const isCuisineAvailable = (availableCategories, cuisineKey) => {
	if (!availableCategories || !cuisineKey) return false;
	const dietMap = CUISINE_DIET_MAPPING[cuisineKey];
	if (!dietMap) return false;
	const possibleCategories = Object.values(dietMap);
	return availableCategories.some((cat) => possibleCategories.includes(cat.value));
};

const isDietAvailableForCuisine = (availableCategories, cuisineKey, dietKey) => {
	if (!availableCategories || !cuisineKey || !dietKey) return false;
	const targetCategory = CUISINE_DIET_MAPPING[cuisineKey]?.[dietKey];
	if (!targetCategory) return false;
	return availableCategories.some((c) => c.value === targetCategory);
};

/**
 * A dynamic component that displays the menu for a selected date.
 * It intelligently highlights the current/next meal, scrolls it into view,
 * and provides clear context when browsing historical dates.
 */
const TodaysMenu = ({ onOpenSettings, onOpenFeedback }) => {
	const [menu, setMenu] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeEvent, setActiveEvent] = useState({
		name: null,
		description: null,
	});
	const [missingPreferenceCycle, setMissingPreferenceCycle] = useState(null);

	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [mealStates, setMealStates] = useState({});
	const [viewingContext, setViewingContext] = useState({
		week: "",
		categoryLabel: "",
	});

	// Overrides for cuisine (S, N, U, P) and diet (Pure Veg, Veg, Non Veg)
	const [selectedCuisineOverride, setSelectedCuisineOverride] = useState(null);
	const [selectedDietOverride, setSelectedDietOverride] = useState(null);

	const mealCardRefs = useRef({});

	const dateRange = useMemo(() => getCalendarDateRange(), []);

	const isPrevDisabled = useMemo(() => {
		if (!dateRange?.minDate) return false;
		const prevDay = subDays(selectedDate, 1);
		return isBefore(prevDay, startOfDay(new Date(dateRange.minDate)));
	}, [dateRange, selectedDate]);

	const isNextDisabled = useMemo(() => {
		if (!dateRange?.maxDate) return false;
		const nextDay = addDays(selectedDate, 1);
		return isAfter(nextDay, endOfDay(new Date(dateRange.maxDate)));
	}, [dateRange, selectedDate]);

	const handlePrevDay = () => {
		if (!isPrevDisabled) {
			setSelectedDate((prev) => subDays(prev, 1));
		}
	};

	const handleNextDay = () => {
		if (!isNextDisabled) {
			setSelectedDate((prev) => addDays(prev, 1));
		}
	};

	const userPreferenceForToday = getPreferenceForCycle(
		getContextForDate(new Date())?.cycleName
	);
	const currentWeek = getCurrentWeek();
	const currentCycle = getContextForDate(new Date())?.cycleName || "Loading...";
	const menuLabel =
		MENUS.find((menu) => menu.value === userPreferenceForToday)?.label ||
		"Not Set";

	const isViewingToday =
		new Date().toDateString() === selectedDate.toDateString();

	const contextForDate = getContextForDate(selectedDate);
	const preferenceForSelectedCycle = getPreferenceForCycle(
		contextForDate?.cycleName
	);
	const defaultParsed = parseCategory(preferenceForSelectedCycle);

	// Check if cuisine override is available in this cycle; if not, fallback to default
	const isOverrideCuisineValid = selectedCuisineOverride
		? isCuisineAvailable(
				contextForDate?.availableCategories,
				selectedCuisineOverride
		  )
		: false;
	const activeCuisine = isOverrideCuisineValid
		? selectedCuisineOverride
		: defaultParsed.cuisine;

	// Check if diet override is available for active cuisine; if not, fallback to default if available, else "Veg"
	const isOverrideDietValid = selectedDietOverride
		? isDietAvailableForCuisine(
				contextForDate?.availableCategories,
				activeCuisine,
				selectedDietOverride
		  )
		: false;
	const activeDiet = isOverrideDietValid
		? selectedDietOverride
		: isDietAvailableForCuisine(
				contextForDate?.availableCategories,
				activeCuisine,
				defaultParsed.diet
		  )
		? defaultParsed.diet
		: "Veg";

	const isModifiedFromDefault =
		(Boolean(selectedCuisineOverride) &&
			selectedCuisineOverride !== defaultParsed.cuisine) ||
		(Boolean(selectedDietOverride) && activeDiet !== defaultParsed.diet);

	const isModified = !isViewingToday || isModifiedFromDefault;

	let categoryToDisplay =
		CUISINE_DIET_MAPPING[activeCuisine]?.[activeDiet] ||
		preferenceForSelectedCycle ||
		contextForDate?.availableCategories?.[0]?.value ||
		"";

	if (
		!isModifiedFromDefault &&
		preferenceForSelectedCycle &&
		contextForDate?.availableCategories?.some(
			(m) => m.value === preferenceForSelectedCycle
		)
	) {
		categoryToDisplay = preferenceForSelectedCycle;
	} else if (
		!contextForDate?.availableCategories?.some(
			(m) => m.value === categoryToDisplay
		)
	) {
		categoryToDisplay =
			preferenceForSelectedCycle ||
			contextForDate?.availableCategories?.[0]?.value ||
			"";
	}

	const handleCuisineSelect = (cuisineKey) => {
		setSelectedCuisineOverride(cuisineKey);
		const isCurrentDietSupported = isDietAvailableForCuisine(
			contextForDate?.availableCategories,
			cuisineKey,
			activeDiet
		);
		if (!isCurrentDietSupported) {
			setSelectedDietOverride("Veg");
		}
	};

	const handleDietSelect = (dietKey) => {
		if (
			isDietAvailableForCuisine(
				contextForDate?.availableCategories,
				activeCuisine,
				dietKey
			)
		) {
			setSelectedDietOverride(dietKey);
		}
	};

	const handleResetToDefault = () => {
		setSelectedDate(new Date());
		setSelectedCuisineOverride(null);
		setSelectedDietOverride(null);
	};

	useEffect(() => {
		const fetchMenuForDate = () => {
			setError(null);
			setActiveEvent({ name: null, description: null });
			setMissingPreferenceCycle(null);
			setViewingContext({ week: "", categoryLabel: "" });

			if (isViewingToday) {
				setMealStates(getMealStates());
			} else {
				setMealStates({});
			}

			const context = getContextForDate(selectedDate);
			if (!context) {
				setError("No menu data found for the selected date.");
				setMenu(null);
				setLoading(false);
				return;
			}

			if (context.eventName) {
				setActiveEvent({
					name: context.eventName,
					description: context.eventDescription,
				});
			}

			const cyclePreference = getPreferenceForCycle(context.cycleName);
			if (!cyclePreference) {
				setMissingPreferenceCycle(context.cycleName);
				setMenu(null);
				setLoading(false);
				return;
			}

			if (!categoryToDisplay) {
				setError(
					`No mess menu is available in the "${context.cycleName}" cycle.`
				);
				setMenu(null);
				setLoading(false);
				return;
			}

			const weekForSelectedDate = getWeekForDate(
				selectedDate,
				categoryToDisplay
			);
			const categoryLabelForDisplay =
				MENUS.find((m) => m.value === categoryToDisplay)?.label ||
				categoryToDisplay;

			setViewingContext({
				week: `Week ${weekForSelectedDate}`,
				categoryLabel: categoryLabelForDisplay,
			});

			const menuData = context.menuContent;
			const categoryData = menuData[categoryToDisplay];
			const dayOfWeek = selectedDate.toLocaleString("en-US", {
				weekday: "long",
			});
			const weekData = categoryData?.[weekForSelectedDate];
			const dayMenu = weekData?.schedule?.[dayOfWeek];

			if (!dayMenu) {
				setMenu(null);
			} else {
				const commonItems = categoryData?.common_items || {};
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
				};
				setMenu(finalMenu);
			}
			setLoading(false);
		};

		fetchMenuForDate();
	}, [selectedDate, isViewingToday, categoryToDisplay]);

	useEffect(() => {
		if (loading || !isViewingToday || !menu) return;

		const activeMeal = Object.keys(mealStates).find(
			(key) => mealStates[key] === "active"
		);
		if (activeMeal) {
			const activeCardElement = mealCardRefs.current[activeMeal];
			if (activeCardElement) {
				setTimeout(() => {
					activeCardElement.scrollIntoView({
						behavior: "smooth",
						block: "nearest",
						inline: "center",
					});
				}, 100);
			}
		}
	}, [loading, isViewingToday, menu, mealStates]);

	const formattedDate = format(selectedDate, "EEEE, MMMM d");

	const renderContent = () => {
		if (missingPreferenceCycle) {
			return (
				<div className="alert alert-destructive text-center">
					<div className="alert-title">Preference Not Set!</div>
					<div className="alert-description">
						You haven't selected a mess for the "{missingPreferenceCycle}"
						cycle.
					</div>
					<button
						onClick={onOpenSettings}
						className="btn-secondary mt-4 inline-flex items-center gap-2"
					>
						<Settings size={16} />
						Open Settings to Choose
					</button>
				</div>
			);
		}
		if (error) {
			return (
				<div className="alert alert-destructive text-center">
					<div className="alert-title">Error!</div>
					<div className="alert-description">{error}</div>
					<button
						onClick={onOpenSettings}
						className="btn-secondary mt-4 inline-flex items-center gap-2"
					>
						<Settings size={16} />
						Open Settings
					</button>
				</div>
			);
		}
		if (menu) {
			const mealsToRender = ["Breakfast", "Lunch", "Snacks", "Dinner"];
			return (
				<div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-x-0 sm:overflow-visible sm:p-0 sm:m-0 lg:grid-cols-4">
					{mealsToRender.map((mealTitle) => (
						<div
							key={mealTitle}
							ref={(el) => (mealCardRefs.current[mealTitle] = el)}
							className="flex-shrink-0 w-[80%] sm:w-auto"
						>
							<MealCard
								title={mealTitle}
								items={menu[mealTitle]}
								commonItems={menu.common[mealTitle]}
								status={isViewingToday ? mealStates[mealTitle] : "future"}
							/>
						</div>
					))}
				</div>
			);
		}
		return (
			<p className="text-center text-muted">No menu items for this meal.</p>
		);
	};

	if (loading) {
		return <TodaysMenuSkeleton />;
	}

	return (
		<section
			id="todays-menu"
			className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-8"
		>
			<CalendarModal
				isOpen={isCalendarOpen}
				onClose={() => setIsCalendarOpen(false)}
				selectedDate={selectedDate}
				onDateSelect={setSelectedDate}
			/>
			<div className="mb-8">
				<div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm text-muted mb-1">
					<div>
						<span className="font-medium">Current Cycle:</span>
						<span className="ml-2 badge badge-primary">{currentCycle}</span>
					</div>
					<div className="mt-1 sm:mt-0">
						<span className="font-medium">Current Week:</span>
						<span className="ml-2 badge badge-primary">Week {currentWeek}</span>
					</div> 
					<div className="mt-1 sm:mt-0">
						<span className="font-medium">Your Mess:</span>
						<span className="ml-2 badge badge-primary">{menuLabel}</span>
					</div>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-muted/80">
					<Settings size={12} />
					<span>You can change your mess preference in settings.</span>
				</div>

				<div className="mt-4">
					<div className="flex flex-row items-center justify-between gap-0 flex-wrap sm:flex-nowrap">
						{/* Left: Title & Day Month Date info */}
						<div className="flex flex-col justify-center py-0.5">
							<h1 className="m-0 text-[29px] sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
								{isViewingToday ? "Today's Menu" : "Menu for"}
							</h1>
							<div className="flex items-center gap-2.5 mt-1.5 sm:mt-2 flex-wrap">
								<p className="text-primary font-medium text-base sm:text-lg md:text-xl m-0 tracking-tight">
									{formattedDate}
								</p>
							</div>
						</div>

						{/* Right: SelectionSuit */}
						<div className="flex flex-col items-center shrink-0 ml-auto sm:ml-0">
							{/* Calendar Navigation Row: < [Calendar] > */}
							<div className="flex items-center justify-center gap-1.5 mb-1.5">
								<button
									onClick={handlePrevDay}
									disabled={isPrevDisabled}
									aria-label="Previous day"
									title="Previous day"
									className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-muted hover:text-fg hover:bg-input-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-reset"
								>
									<ChevronLeft size={16} />
								</button>
								<button
									onClick={() => setIsCalendarOpen(true)}
									aria-label="Select date from calendar"
									title="Open calendar"
									className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border border-border bg-input-bg text-muted hover:text-primary hover:border-primary/50 transition-colors focus-reset"
								>
									<CalendarDays size={16} />
								</button>
								<button
									onClick={handleNextDay}
									disabled={isNextDisabled}
									aria-label="Next day"
									title="Next day"
									className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-muted hover:text-fg hover:bg-input-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-reset"
								>
									<ChevronRight size={16} />
								</button>
							</div>

							{/* Top Row: S N U P */}
							<div className="flex items-center gap-1.5 mb-1.5">
								{CUISINES.map((cuisine) => {
									const isAvailable = isCuisineAvailable(
										contextForDate?.availableCategories,
										cuisine.key
									);
									const isActive = activeCuisine === cuisine.key;
									return (
										<button
											key={cuisine.key}
											onClick={() => handleCuisineSelect(cuisine.key)}
											disabled={!isAvailable}
											title={`${cuisine.label}${
												!isAvailable
													? " (Not available in this cycle)"
													: ""
											}`}
											aria-label={cuisine.label}
											aria-pressed={isActive}
											className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all focus-reset ${
												isActive
													? "border-2 border-primary text-primary bg-primary/10 shadow-xs scale-105"
													: isAvailable
													? "border border-border bg-input-bg text-fg hover:border-muted/50 hover:bg-input-bg/80 active:scale-95"
													: "opacity-30 cursor-not-allowed border-border/40 bg-input-bg/20 text-muted/40"
											}`}
										>
											{cuisine.short}
										</button>
									);
								})}
							</div>

							{/* Bottom Row: Pure Veg, Veg, Non Veg, Reset */}
							<div className="flex items-center gap-1.5">
								{DIETS.map((diet) => {
									const isDietAvailable = isDietAvailableForCuisine(
										contextForDate?.availableCategories,
										activeCuisine,
										diet.key
									);
									const isDietActive = activeDiet === diet.key;
									return (
										<button
											key={diet.key}
											onClick={() => handleDietSelect(diet.key)}
											disabled={!isDietAvailable}
											title={`${diet.label}${
												!isDietAvailable
													? " (Not available for selected mess)"
													: ""
											}`}
											aria-label={diet.label}
											aria-pressed={isDietActive}
											className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all focus-reset ${
												isDietActive
													? "border-2 border-primary bg-primary/10 shadow-xs scale-105"
													: isDietAvailable
													? "border border-border bg-input-bg hover:border-muted/50 hover:bg-input-bg/80 active:scale-95"
													: "opacity-30 cursor-not-allowed border-border/40 bg-input-bg/20"
											}`}
										>
											{(diet.key === "Pureveg" ||
												diet.key === "Pure_Veg") && (
												<span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2.5px] border-[1.5px] border-emerald-400 dark:border-emerald-300 flex items-center justify-center shrink-0">
													<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-300" />
												</span>
											)}
											{diet.key === "Veg" && (
												<span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2.5px] border-[1.5px] border-green-600 dark:border-green-500 flex items-center justify-center shrink-0">
													<span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500" />
												</span>
											)}
											{(diet.key === "Nonveg" ||
												diet.key === "Non_Veg") && (
												<span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2.5px] border-[1.5px] border-red-600 dark:border-red-500 flex items-center justify-center shrink-0">
													<span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500" />
												</span>
											)}
										</button>
									);
								})}

								{/* 4th Button: Default / Reset */}
								<button
									onClick={handleResetToDefault}
									title={
										isModified
											? `Reset to today & default mess (${menuLabel})`
											: "Default mess preference & today active"
									}
									aria-label="Reset to default mess preference and today"
									className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all focus-reset ${
										isModified
											? "border-2 border-primary/50 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary active:scale-95 cursor-pointer shadow-xs"
											: "border border-border bg-input-bg text-muted/60 hover:text-fg hover:bg-input-bg/80 active:scale-95 cursor-pointer"
									}`}
								>
									<RotateCcw size={14} />
								</button>
							</div>
						</div>
					</div>

					{/* The Historical Date or Mess Context Bar */}
					{isModified && !loading && menu && (
						<div className="mt-4 p-2.5 sm:p-3 rounded-xl bg-input-bg border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-2 gap-x-4 text-xs sm:text-sm sm:w-fit">
							<p className="font-medium text-muted shrink-0 m-0">
								Showing Menu For:
							</p>
							<div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
								<div className="flex items-center gap-1.5">
									<UtensilsCrossed size={14} className="text-primary" />
									<span className="font-semibold text-fg">
										{viewingContext.categoryLabel}
									</span>
								</div>
								<div className="flex items-center gap-1.5">
									<CalendarDays size={14} className="text-primary" />
									<span className="font-semibold text-fg">
										{viewingContext.week}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
				{activeEvent.name && (
					<div className="event-banner mt-4">
						<div className="event-banner-title">
							<Sparkles size={16} />
							{activeEvent.name}
						</div>
						{activeEvent.description && (
							<div
								className="event-banner-description whitespace-pre-line leading-relaxed"
								onClick={(e) => {
									const anchor = e.target.closest("a, button");
									if (anchor) {
										const href = anchor.getAttribute("href");
										const action = anchor.getAttribute("data-action");
										const normHref = href?.trim().toLowerCase();
										if (
											normHref === "#feedback" ||
											normHref === "#feedbackmodal" ||
											normHref === "action:feedback" ||
											normHref === "feedback" ||
											action === "feedback"
										) {
											e.preventDefault();
											onOpenFeedback?.();
										}
									}
								}}
							>
								<EventDescription
									content={activeEvent.description}
									onOpenFeedback={onOpenFeedback}
								/>
							</div>
						)}
					</div>
				)}
			</div>
			{renderContent()}
		</section>
	);
};

export default TodaysMenu;
