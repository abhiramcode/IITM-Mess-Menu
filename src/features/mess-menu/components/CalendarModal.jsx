import React, { useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { getCalendarDateRange } from "../api/menuApi";
import { enGB } from "date-fns/locale"; // locale for week start day

const PRIMARY_COLOR = "#f97316";

/**
 * A themed, accessible, and centered modal for selecting a date.
 * It dynamically restricts the selectable date range and shows outside days.
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   selectedDate: Date;
 *   onDateSelect: (date: Date) => void;
 * }} props
 */
const CalendarModal = ({ isOpen, onClose, selectedDate, onDateSelect }) => {
	const dateRange = useMemo(() => getCalendarDateRange(), []);

	const isDarkMode = document.documentElement.classList.contains("dark");

	const muiTheme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: isDarkMode ? "dark" : "light",
					primary: { main: PRIMARY_COLOR },
					background: { paper: isDarkMode ? "#1f2937" : "#ffffff" },
				},
				typography: { fontFamily: '"Poppins", sans-serif' },
				components: {
					MuiDateCalendar: {
						styleOverrides: {
							root: { backgroundColor: "transparent" },
						},
					},
					MuiPickersDay: {
						styleOverrides: {
							root: {
								borderRadius: "9999px",
								"&:hover": {
									backgroundColor: isDarkMode
										? "rgba(249, 115, 22, 0.1)"
										: "#ffedd5",
								},
								// --- NEW STYLE FOR OUTSIDE DAYS ---
								"&.MuiDayPicker-DayOutsideMonth": {
									color: isDarkMode
										? "rgba(156, 163, 175, 0.4)"
										: "rgba(107, 114, 128, 0.4)", // Muted color with opacity
								},
							},
							today: {
								borderColor: PRIMARY_COLOR,
								borderWidth: "1px", // Changed to 1px for a more subtle look
							},
						},
					},
					MuiPickersArrowSwitcher: {
						styleOverrides: {
							button: {
								"&:hover": {
									backgroundColor: isDarkMode
										? "rgba(255, 255, 255, 0.08)"
										: "#f1f5f9",
								},
							},
						},
					},
				},
			}),
		[isDarkMode],
	);

	if (!isOpen) return null;

	const handleDateChange = (newDate) => {
		if (newDate) {
			onDateSelect(newDate);
		}
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm animate-fade-in"
			onClick={onClose}
		>
			<div
				className="rounded-xl shadow-2xl border border-border overflow-hidden bg-bg"
				onClick={(e) => e.stopPropagation()}
			>
				<ThemeProvider theme={muiTheme}>
					<LocalizationProvider
						dateAdapter={AdapterDateFns}
						adapterLocale={enGB} // Sets week start to Monday
					>
						<DateCalendar
							value={selectedDate}
							onChange={handleDateChange}
							fixedWeekNumber={5}
							views={["day"]}
							minDate={dateRange?.minDate}
							maxDate={dateRange?.maxDate}
							// --- THE FIX IS HERE ---
							showDaysOutsideCurrentMonth
						/>
					</LocalizationProvider>
				</ThemeProvider>
			</div>
		</div>
	);
};

export default CalendarModal;
