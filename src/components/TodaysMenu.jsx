import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
	CalendarDays,
	RotateCcw,
	Settings,
	Sparkles,
	UtensilsCrossed,
} from "lucide-react";

import { MENUS } from "../api/constants";
import { getContextForDate } from "../api/menuApi";
import {
	getCurrentWeek,
	getPreferenceForCycle,
	getWeekForDate,
	getMealStates,
} from "../utils/weekManager";
import CalendarModal from "./CalendarModal";
import MealCard from "./MealCard";
import TodaysMenuSkeleton from "./skeletons/TodaysMenuSkeleton";

/**
 * A dynamic component that displays the menu for a selected date.
 * It intelligently highlights the current/next meal, scrolls it into view,
 * and provides clear context when browsing historical dates.
 */
const TodaysMenu = ({ onOpenSettings }) => {
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

	const mealCardRefs = useRef({});

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

	useEffect(() => {
		const fetchMenuForDate = () => {
			setLoading(true);
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

			const preferenceForSelectedCycle = getPreferenceForCycle(
				context.cycleName
			);
			if (!preferenceForSelectedCycle) {
				setMissingPreferenceCycle(context.cycleName);
				setMenu(null);
				setLoading(false);
				return;
			}

			const isPreferenceValid = context.availableCategories.some(
				(menu) => menu.value === preferenceForSelectedCycle
			);

			if (!isPreferenceValid) {
				setError(
					`Your preferred mess is not available in the "${context.cycleName}" cycle. Please choose another in settings.`
				);
				setMenu(null);
				setLoading(false);
				return;
			}

			const weekForSelectedDate = getWeekForDate(
				selectedDate,
				preferenceForSelectedCycle,
			);
			const categoryToDisplay = preferenceForSelectedCycle;
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
			const weekData = categoryData[weekForSelectedDate];
			const dayMenu = weekData?.schedule[dayOfWeek];

			if (!dayMenu) {
				setMenu(null);
			} else {
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
				};
				setMenu(finalMenu);
			}
			setLoading(false);
		};

		fetchMenuForDate();
	}, [selectedDate, isViewingToday]);

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
		if (loading) {
			return <TodaysMenuSkeleton />;
		}
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
					<span>You can change your mess preference in the settings.</span>
				</div>

				<div className="mt-4">
					<div className="flex items-center gap-4">
						<h1 className="m-0">
							{isViewingToday ? "Today's Menu" : "Menu for"}{" "}
							<span className="text-primary">{formattedDate}</span>
						</h1>
						<button
							onClick={() => setIsCalendarOpen(true)}
							className="p-2 rounded-full text-muted hover:text-primary hover:bg-input-bg transition-colors"
							aria-label="Select a date"
						>
							<CalendarDays size={24} />
						</button>
						{!isViewingToday && (
							<button
								onClick={() => setSelectedDate(new Date())}
								className="flex items-center gap-2 text-sm btn-secondary"
								aria-label="Back to today's menu"
							>
								<RotateCcw size={16} />
								<span>Today</span>
							</button>
						)}
					</div>

					{/* The Historical Date Context Bar */}
					{!isViewingToday && !loading && menu && (
						// --- THE FIX IS HERE ---
						// On small screens it's full-width, on larger screens it fits its content.
						<div className="mt-4 p-3 rounded-lg bg-input-bg border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-2 gap-x-4 text-sm sm:w-fit">
							<p className="font-medium text-muted shrink-0">
								Showing Menu For:
							</p>
							<div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
								<div className="flex items-center gap-1.5">
									<UtensilsCrossed size={16} className="text-muted" />
									<span className="font-semibold text-fg">
										{viewingContext.categoryLabel}
									</span>
								</div>
								<div className="flex items-center gap-1.5">
									<CalendarDays size={16} className="text-muted" />
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
							<div className="event-banner-description">
								{activeEvent.description}
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
