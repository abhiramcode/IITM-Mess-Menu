export const APP_NAME = "DigiMess";

export const MENUS = [
	{ value: "South_Veg", label: "South Indian (Veg)" },
	{ value: "South_Non_Veg", label: "South Indian (Non-Veg)" },
	{ value: "North_Veg", label: "North Indian (Veg)" },
	{ value: "North_Non_Veg", label: "North Indian (Non-Veg)" },
	{
		value: "North_Veg_No_Onion_Garlic",
		label: "North Indian (No Onion/Garlic)",
	},
	{ value: "Unified_Veg", label: "Unified (Veg)" },
	{ value: "Unified_Non_Veg", label: "Unified (Non-Veg)" },
	{ value: "Protein_Veg", label: "Protein (Veg)" },
	{ value: "Protein_Non_Veg", label: "Protein (Non-Veg)" },
];

export const CATEGORY_REFERENCE_DATES = {
	South_Veg: {
		"2025-07-28": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	South_Non_Veg: {
		"2025-07-28": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	North_Veg: {
		"2025-07-28": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	North_Non_Veg: {
		"2025-07-28": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	North_Veg_No_Onion_Garlic: {
		"2025-07-28": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	Unified_Veg: {
		"2025-07-28": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	Unified_Non_Veg: {
		"2025-07-28": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	Protein_Veg: {
		"2026-01-19": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	Protein_Non_Veg: {
		"2026-01-19": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
	DEFAULT: {
		"2025-07-28": "A",
		"2026-04-01": "A",
		"2026-07-27": "A",
	},
};

export const WEEKS = [
	{ value: "A", label: "Week A" },
	{ value: "B", label: "Week B" },
	{ value: "C", label: "Week C" },
	{ value: "D", label: "Week D" },
];

export const DAYS = [
	{ value: "Monday", label: "Monday" },
	{ value: "Tuesday", label: "Tuesday" },
	{ value: "Wednesday", label: "Wednesday" },
	{ value: "Thursday", label: "Thursday" },
	{ value: "Friday", label: "Friday" },
	{ value: "Saturday", label: "Saturday" },
	{ value: "Sunday", label: "Sunday" },
];

export const MEALS = [
	{
		value: "Breakfast",
		label: "Breakfast",
		timing: "7:00 AM - 9:30 AM",
		start: "07:00",
		end: "09:30",
	},
	{
		value: "Lunch",
		label: "Lunch",
		timing: "12:00 PM - 2:30 PM",
		start: "12:00",
		end: "14:30",
	},
	{
		value: "Snacks",
		label: "Snacks",
		timing: "4:30 PM - 5:30 PM",
		start: "16:30",
		end: "17:30",
	},
	{
		value: "Dinner",
		label: "Dinner",
		timing: "7:00 PM - 9:30 PM",
		start: "19:00",
		end: "21:30",
	},
];

export const DAY_SHORTCUTS = [
	{ value: "Monday", label: "Mon" },
	{ value: "Tuesday", label: "Tue" },
	{ value: "Wednesday", label: "Wed" },
	{ value: "Thursday", label: "Thu" },
	{ value: "Friday", label: "Fri" },
	{ value: "Saturday", label: "Sat" },
	{ value: "Sunday", label: "Sun" },
];
