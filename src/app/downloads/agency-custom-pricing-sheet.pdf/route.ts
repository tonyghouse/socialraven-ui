import { generateAgencyCustomPricingSheetPdf } from "@/lib/agency-custom-pricing-sheet-pdf";

export const runtime = "nodejs";
const FILENAME = "agency-custom-pricing-sheet.pdf";

function buildHeaders(contentLength: number) {
  return {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${FILENAME}"`,
    "Cache-Control": "public, max-age=3600",
    "Content-Length": String(contentLength),
  };
}

export async function GET() {
  const file = generateAgencyCustomPricingSheetPdf();
  return new Response(file, { headers: buildHeaders(file.length) });
}

export async function HEAD() {
  const file = generateAgencyCustomPricingSheetPdf();
  return new Response(null, { headers: buildHeaders(file.length) });
}
