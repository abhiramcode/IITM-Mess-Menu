const jsonResponse = (body, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(url, { ...options, signal: controller.signal });
	} finally {
		clearTimeout(timeoutId);
	}
};

/**
 * Cloudflare Pages Function.
 *
 * The submission flow is intentionally the same as the previous Vercel
 * function: send to SplitForms and Google Sheets in parallel, then report
 * success if either configured destination succeeds.
 */
export async function onRequest({ request, env = {} }) {
	if (request.method !== "POST") {
		return jsonResponse({ message: "Method Not Allowed" }, 405);
	}

	let payload;
	try {
		payload = await request.json();
	} catch (error) {
		console.error("Invalid feedback request body:", error);
		return jsonResponse({ message: "Invalid JSON body" }, 400);
	}

	const { type, subType, description, contact } = payload;

	try {
		if (!env.SPLITFORMS_ACCESS_KEY) {
			console.warn("SPLITFORMS_ACCESS_KEY is not configured.");
		}
		if (!env.GOOGLE_SHEETS_URL) {
			console.warn("GOOGLE_SHEETS_URL is not configured.");
		}

		// 1. Submit to SplitForms
		let splitformsPromise = Promise.resolve({ ok: false });
		if (env.SPLITFORMS_ACCESS_KEY) {
			const splitFormsUrl = `https://splitforms.com/api/submit`;
			splitformsPromise = fetchWithTimeout(splitFormsUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
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
			const now = new Date();
			// Cloudflare runs in UTC. Convert to IST without Intl/time-zone
			// support so the Function is portable across runtime versions.
			const ist = new Date(
				now.getTime() + now.getTimezoneOffset() * 60000 + 330 * 60000,
			);

			// 1. Format the date to DD-MM-YYYY in IST
			const day = String(ist.getDate()).padStart(2, "0");
			const month = String(ist.getMonth() + 1).padStart(2, "0");
			const year = ist.getFullYear();
			const date = `${day}-${month}-${year}`;

			// 2. Format the time to HH:mm:ss in 24-hour format in IST
			const hours = String(ist.getHours()).padStart(2, "0");
			const minutes = String(ist.getMinutes()).padStart(2, "0");
			const seconds = String(ist.getSeconds()).padStart(2, "0");
			const time = `${hours}:${minutes}:${seconds}`;

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

			googleSheetsPromise = fetchWithTimeout(env.GOOGLE_SHEETS_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				redirect: "follow",
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
