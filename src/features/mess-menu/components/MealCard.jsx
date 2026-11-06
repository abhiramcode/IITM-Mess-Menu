import React from "react";
import { Circle } from "lucide-react";
import { MEALS } from "../api/constants";
import MenuIcon from "./MenuIcon";
import MenuItem from "./MenuItem";

const MealCard = ({ title, items, commonItems, status, hasEventOverride = false }) => {
	const mealInfo = MEALS.find((meal) => meal.value === title);
	const timing = mealInfo ? mealInfo.timing : null;

	const getContainerClasses = () => {
		const baseClasses =
			"border rounded-xl p-5 flex flex-col h-full shadow-sm transition-all duration-300";
		const bgClasses = "bg-white dark:bg-input-bg";

		switch (status) {
			case "active":
				return `${baseClasses} ${bgClasses} border-primary ring-2 ring-primary/20`;
			case "past":
			case "future":
			default:
				return `${baseClasses} ${bgClasses} border-border`;
		}
	};

	const contentOpacityClass = status === "past" ? "opacity-60" : "";

	const renderBody = () => {
		if (!items || items.length === 0) {
			return (
				<div
					className={`${getContainerClasses()} items-center justify-center min-h-[200px]`}
				>
					<div className={contentOpacityClass}>
						<p className="text-muted">No {title} Today</p>
					</div>
				</div>
			);
		}

		return (
			// --- THE MAIN LAYOUT FIX IS HERE ---
			<div className={getContainerClasses()}>
				<div className={`flex flex-col h-full ${contentOpacityClass}`}>
					{/* --- Header Section (Fixed at the top) --- */}
					<div className="pb-4 border-b border-border/50">
						<div className="flex items-center gap-3">
							<MenuIcon meal={title} className="text-primary" />
							<div>
								<h3 className="text-xl font-semibold text-fg m-0">{title}</h3>
								{timing && <p className="text-xs text-muted m-0">{timing}</p>}
							</div>
						</div>
					</div>

					{/* --- Main Content Area (Grows to fill space) --- */}
					<ul className="flex-grow space-y-2 text-muted pt-4">
						{items.map((item, index) => (
							<li key={index} className="flex gap-2 items-center">
								<Circle
									className="text-primary flex-shrink-0 self-center"
									size={6}
									fill="currentColor"
								/>
								<div className="flex-grow">
									<MenuItem item={item} />
								</div>
							</li>
						))}
					</ul>

					{/* --- Common Items (Fixed at the bottom) --- */}
					{commonItems && (
						<div className="mt-4 pt-4 border-t border-border/50 flex-shrink-0">
							<p className="text-xs font-semibold text-muted uppercase tracking-wider">
								Common Items
							</p>
							<p className="text-sm text-muted/80 mt-1">{commonItems}</p>
						</div>
					)}
				</div>
			</div>
		);
	};

	if (!hasEventOverride) {
		return renderBody();
	}

	return (
		<div className="relative h-full rounded-xl p-[2.5px] shadow-lg overflow-hidden">
			<span
				aria-hidden="true"
				className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#06b6d4_0%,#d946ef_33%,#f97316_66%,#06b6d4_100%)]"
			/>
			<div className="relative h-full">{renderBody()}</div>
		</div>
	);
};

export default MealCard;
