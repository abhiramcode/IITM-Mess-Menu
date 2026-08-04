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
        body: JSON.stringify({ 
          access_key: process.env.SPLITFORMS_ACCESS_KEY,
          type, 
          subType, 
          description, 
          contact 
        }),
      }).catch(err => {
        console.error("Splitforms fetch error:", err);
        return { ok: false };
      });
    } else {
      // console.warn("SPLITFORMS_ACCESS_KEY is not set.");
    }

    // 2. Submit to Google Sheets
    let googleSheetsPromise = Promise.resolve({ ok: false });
    if (process.env.GOOGLE_SHEETS_URL) {
      googleSheetsPromise = fetch(process.env.GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subType, description, contact }),
      }).catch(err => {
        console.error("Google Sheets fetch error:", err);
        return { ok: false };
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
