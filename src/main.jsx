import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

// ==========================================================================
// --- TIME TRAVEL FOR DEVELOPMENT ---
// This block will be automatically removed from the production build.
// ==========================================================================
// if (import.meta.env.DEV) {
// 	const travelToDate = "2026-01-20T10:00:00+05:30"; // <-- SET YOUR TARGET DATE HERE

// 	// We are overriding the global Date object.
// 	// Now, every time any part of your app calls `new Date()`,
// 	// it will get our fake date instead of the real one.
// 	const OriginalDate = window.Date;
// 	class MockDate extends OriginalDate {
// 		constructor(dateString) {
// 			// If a specific date is requested (like in the calendar), use it.
// 			// Otherwise, always return our "fake now".
// 			if (dateString) {
// 				super(dateString);
// 			} else {
// 				super(travelToDate);
// 			}
// 		}
// 	}
// 	window.Date = MockDate;
// }
// ==========================================================================
// --- END OF TIME TRAVEL BLOCK ---
// ==========================================================================

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<ThemeProvider>
			<App />
		</ThemeProvider>
	</React.StrictMode>
);
