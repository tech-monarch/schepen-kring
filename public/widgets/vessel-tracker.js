(function () {
  // 1. Configuration & Metadata
  const API_ENDPOINT = "https://schepen-kring.nl/api/analytics/track";
  const currentUrl = window.location.href;

  // Extract Slug and External ID from URL
  // Format: .../aanbod-boten/2006391/quicksilver-645-cruiser/
  const urlParts = window.location.pathname.split("/").filter(Boolean);
  const externalId = urlParts[1]; // 2006391
  const slug = urlParts[2]; // quicksilver-645-cruiser

  const scanBoatData = () => {
    const data = {
      external_id: externalId,
      slug: slug,
      url: currentUrl,
      specs: {},
    };

    // Extract Name (Usually H1)
    data.name = document.querySelector("h1")?.innerText.trim();

    // Scan the Specification Table
    // We look for <tr> elements containing the labels you mentioned
    const rows = document.querySelectorAll("tr");
    rows.forEach((row) => {
      const label = row.querySelector("td:first-child")?.innerText.trim();
      const value = row.querySelector("td:last-child")?.innerText.trim();

      if (label && value) {
        // Mapping Dutch labels to English keys for your DB
        if (label.includes("Vraagprijs")) data.price = value;
        if (label.includes("Bouwjaar")) data.year = value;
        if (label.includes("Merk / model")) data.model = value;
        if (label.includes("Referentiecode")) data.ref_code = value;
        if (label.includes("Ligplaats")) data.location = value;

        // Store everything else in a raw specs object
        data.specs[label] = value;
      }
    });

    return data;
  };

  const sendToAnalytics = async () => {
    const boatData = scanBoatData();

    try {
      // Using fetch with 'keepalive' ensures the request finishes
      // even if the user closes the tab quickly
      await fetch(API_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...boatData,
          referrer: document.referrer,
          resolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
        }),
        keepalive: true,
      });
    } catch (err) {
      console.warn("Tracker Sync Failed");
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === "complete") {
    sendToAnalytics();
  } else {
    window.addEventListener("load", sendToAnalytics);
  }
})();
