export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { type, subType, description, contact } = req.body;

  try {
    // 1. Submit to SplitForms
    let splitformsPromise = Promise.resolve({ ok: false });
    if (process.env.SPLITFORMS_ACCESS_KEY) {
      const splitFormsUrl = `https://splitforms.com/api/submit`;
      splitformsPromise = fetch(splitFormsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({ 
          access_key: process.env.SPLITFORMS_ACCESS_KEY,
          type, 
          subType, 
          description, 
          contact
        }),
      })
      .then(res => ({ ok: res.ok, status: res.status }))
      .catch(err => {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          console.warn("Splitforms fetch timed out (5s), but request was sent.");
          return { ok: true, status: 202 }; // Assume success since it was sent
        }
        console.error("Splitforms fetch network error:", err);
        return { ok: false, status: "NETWORK_ERROR" };
      });
    } else {
      // console.warn("SPLITFORMS_ACCESS_KEY is not set.");
    }

    // 2. Submit to Google Sheets
    let googleSheetsPromise = Promise.resolve({ ok: false });
    if (process.env.GOOGLE_SHEETS_URL) {
      
      const dateObj = new Date();

      // 1. Format the date to DD-MM-YYYY in IST
      const formatter = new Intl.DateTimeFormat('en-GB', { 
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const parts = formatter.formatToParts(dateObj);
      const day = parts.find(p => p.type === 'day').value;
      const month = parts.find(p => p.type === 'month').value;
      const year = parts.find(p => p.type === 'year').value;
      const date = `${day}-${month}-${year}`;

      // 2. Format the time to HH:mm:ss in 24-hour format in IST
      const time = new Intl.DateTimeFormat('en-GB', { 
        timeZone: 'Asia/Kolkata', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
      }).format(dateObj);

      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      // const ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const sourcePort = req.headers['x-forwarded-port'] || req.socket.remotePort || 'Unknown';
      const country = req.headers['x-vercel-ip-country'] || 'Unknown';
      const region = req.headers['x-vercel-ip-country-region'] || 'Unknown'; // Added: State/Province (e.g., TN for Tamil Nadu)
      const city = req.headers['x-vercel-ip-city'] || 'Unknown';
      const latitude = req.headers['x-vercel-ip-latitude'] || 'Unknown';   // Added for precise routing audits
      const longitude = req.headers['x-vercel-ip-longitude'] || 'Unknown'; // Added
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const toShow = true;

      googleSheetsPromise = fetch(process.env.GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({ date, time, type, subType, description, contact, ipAddress, sourcePort, country, region, city, latitude, longitude, userAgent, toShow }),
      })
      .then(res => ({ ok: res.ok, status: res.status }))
      .catch(err => {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          console.warn("Google Sheets fetch timed out (5s), but request was sent.");
          return { ok: true, status: 202 }; // Assume success since it was sent
        }
        console.error("Google Sheets fetch network error:", err);
        return { ok: false, status: "NETWORK_ERROR" };
      });
    } else {
      // console.warn("GOOGLE_SHEETS_URL is not set.");
    }

    // Await both promises for Dual Submission
    const [splitRes, googleRes] = await Promise.all([splitformsPromise, googleSheetsPromise]);

    const splitOk = splitRes && splitRes.ok;
    const googleOk = googleRes && googleRes.ok;

    if (!splitOk && process.env.SPLITFORMS_ACCESS_KEY) console.error("SplitForms submission failed with status:", splitRes?.status);
    if (!googleOk && process.env.GOOGLE_SHEETS_URL) console.error("Google Sheets submission failed with status:", googleRes?.status);

    if (splitOk || googleOk) {
      return res.status(200).json({ message: "Feedback submitted successfully" });
    } else {
      return res.status(500).json({ message: "All configured submissions failed" });
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
