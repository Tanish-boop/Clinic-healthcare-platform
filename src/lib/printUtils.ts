/**
 * Isolated Clinical Print Engine for A4 Passes, Prescriptions, and Tax Invoices
 * Guarantees zero blank pages, zero background bleeding, and millimeter-exact A4 alignment.
 */

export function printIsolatedSlip(element: HTMLElement | null) {
  if (!element) {
    window.print();
    return;
  }

  // Create an invisible sandboxed print iframe
  const iframe = document.createElement("iframe");
  iframe.setAttribute("style", "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;z-index:-9999;");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Extract all existing stylesheet link tags and style blocks from the parent page
  let styleTags = "";
  document.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
    styleTags += node.outerHTML;
  });

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Apex Dental & Aesthetic Lounge - Clinical Printout</title>
        ${styleTags}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            width: 100% !important;
            height: auto !important;
          }
          .printable-slip-container {
            width: 100% !important;
            max-width: 190mm !important;
            margin: 0 auto !important;
            padding: 4mm 6mm !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            border: 1.5px solid #334155 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Wait briefly for styles and fonts to paint, then trigger print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("Iframe print error, falling back to window.print()", e);
      window.print();
    } finally {
      // Clean up iframe after print dialog closes
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  }, 300);
}
