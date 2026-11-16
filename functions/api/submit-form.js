const jsonResponse = (body, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

/**
 * Cloudflare Pages Function.
 *
 * The submission flow is intentionally the same as the previous Vercel
 * function: send to SplitForms and Google Sheets in parallel, then report
 * success if either configured destination succeeds.
 */
export async function onRequest({ request, env }) {
	if (request.method !== "POST") {
		return jsonResponse({ message: "Method Not Allowed" }, 405);
	}

	const { type, subType, description, contact } = await request.json();

	try {
		// 1. Submit to SplitForms
		let splitformsPromise = Promise.resolve({ ok: false });
		if (env.SPLITFORMS_ACCESS_KEY) {
			const splitFormsUrl = `https://splitforms.com/api/submit`;
			splitformsPromise = fetch(splitFormsUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				signal: AbortSignal.timeout(5000),
				body: JSON.stringify({
					access_key: env.SPLITFORMS_ACCESS_KEY,
					type,
					subType,
					description,
					contact,
				}),
			})
				.then((res) => ({ ok: res.ok, status: res.status }))
				.catch((err) => {
					if (err.name === "TimeoutError" || err.name === "AbortError") {
						console.warn(
							"Splitforms fetch timed out (5s), but request was sent.",
						);
						return { ok: true, status: 202 }; // Assume success since it was sent
					}
					console.error("Splitforms fetch network error:", err);
					return { ok: false, status: "NETWORK_ERROR" };
				});
		}

		// 2. Submit to Google Sheets
		let googleSheetsPromise = Promise.resolve({ ok: false });
		if (env.GOOGLE_SHEETS_URL) {
			const dateObj = new Date();

			// 1. Format the date to DD-MM-YYYY in IST
			const formatter = new Intl.DateTimeFormat("en-GB", {
				timeZone: "Asia/Kolkata",
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
			const parts = formatter.formatToParts(dateObj);
			const day = parts.find((p) => p.type === "day").value;
			const month = parts.find((p) => p.type === "month").value;
			const year = parts.find((p) => p.type === "year").value;
			const date = `${day}-${month}-${year}`;

			// 2. Format the time to HH:mm:ss in 24-hour format in IST
			const time = new Intl.DateTimeFormat("en-GB", {
				timeZone: "Asia/Kolkata",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			}).format(dateObj);

			// Cloudflare provides client metadata via request.cf and CF-Connecting-IP.
			const ipAddress =
				request.headers.get("cf-connecting-ip") ||
				request.headers.get("x-forwarded-for") ||
				"Unknown";
			const sourcePort =
				request.headers.get("x-forwarded-port") || "Unknown";
			const cf = request.cf || {};
			const country = cf.country || "Unknown";
			const region = cf.region || "Unknown";
			const city = cf.city || "Unknown";
			const latitude = cf.latitude || "Unknown";
			const longitude = cf.longitude || "Unknown";
			const userAgent = request.headers.get("user-agent") || "Unknown";
			const toShow = true;

			googleSheetsPromise = fetch(env.GOOGLE_SHEETS_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				redirect: "follow",
				signal: AbortSignal.timeout(5000),
				body: JSON.stringify({
					date,
					time,
					type,
					subType,
					description,
					contact,
					ipAddress,
					sourcePort,
					country,
					region,
					city,
					latitude,
					longitude,
					userAgent,
					toShow,
				}),
			})
				.then((res) => ({ ok: res.ok, status: res.status }))
				.catch((err) => {
					if (err.name === "TimeoutError" || err.name === "AbortError") {
						console.warn(
							"Google Sheets fetch timed out (5s), but request was sent.",
						);
						return { ok: true, status: 202 }; // Assume success since it was sent
					}
					console.error("Google Sheets fetch network error:", err);
					return { ok: false, status: "NETWORK_ERROR" };
				});
		}

		// Await both promises for Dual Submission
		const [splitRes, googleRes] = await Promise.all([
			splitformsPromise,
			googleSheetsPromise,
		]);

		const splitOk = splitRes && splitRes.ok;
		const googleOk = googleRes && googleRes.ok;

		if (!splitOk && env.SPLITFORMS_ACCESS_KEY)
			console.error(
				"SplitForms submission failed with status:",
				splitRes?.status,
			);
		if (!googleOk && env.GOOGLE_SHEETS_URL)
			console.error(
				"Google Sheets submission failed with status:",
				googleRes?.status,
			);

		if (splitOk || googleOk) {
			return jsonResponse({ message: "Feedback submitted successfully" });
		} else {
			return jsonResponse({ message: "All configured submissions failed" }, 500);
		}
	} catch (error) {
		console.error("Error submitting feedback:", error);
		return jsonResponse({ message: "Internal Server Error" }, 500);
	}
}
