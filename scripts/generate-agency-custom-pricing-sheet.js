const fs = require("node:fs");
const path = require("node:path");

const OUTPUT_PATH = path.join(__dirname, "..", "public", "docs", "agency-custom-pricing-sheet.pdf");

const PAGE = {
  width: 595,
  height: 842,
};

const COLORS = {
  brand: [0.0, 0.3216, 0.8],
  brandDark: [0.0, 0.2392, 0.6392],
  brandSoft: [0.9333, 0.9647, 1.0],
  brandBorder: [0.7804, 0.8706, 0.9725],
  ink: [0.09, 0.1, 0.13],
  muted: [0.33, 0.37, 0.45],
  line: [0.87, 0.9, 0.94],
  panel: [0.98, 0.985, 1.0],
  white: [1.0, 1.0, 1.0],
  headerTint: [0.89, 0.93, 1.0],
};

const pricingBullets = [
  "Agency Custom begins after the 10-workspace Agency Pro limit.",
  "Base custom price: USD 300 per month for 30 workspaces.",
  "Each additional workspace is billed at USD 3 per month.",
  "Final pricing is confirmed before purchase.",
];

const providerBullets = [
  "All providers keep their own platform-side limits and publishing rules.",
  "SocialRaven pricing does not remove provider-side caps.",
  "X.com is capped at 1000 posts per workspace.",
  "Other providers may enforce different limits under their own platform policies.",
];

const billingBullets = [
  "Billed monthly in advance.",
  "Applicable taxes are shown in the billing flow where required.",
  "Paid subscription charges processed through Paddle carry a minimum 14-day refund window.",
];

function escapePdfText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function measureText(text, size, font) {
  const widthFactor = font === "F2" ? 0.58 : 0.53;
  return text.length * size * widthFactor;
}

function wrapText(text, maxWidth, size, font) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measureText(candidate, size, font) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

const ops = [];

function fmt(value) {
  return Number(value).toFixed(2).replace(/\.00$/, "");
}

function push(line) {
  ops.push(line);
}

function setFillColor([r, g, b]) {
  push(`${r} ${g} ${b} rg`);
}

function setStrokeColor([r, g, b]) {
  push(`${r} ${g} ${b} RG`);
}

function drawRect(x, y, width, height, {
  fillColor,
  strokeColor,
  lineWidth = 1,
} = {}) {
  if (fillColor && strokeColor) {
    setFillColor(fillColor);
    setStrokeColor(strokeColor);
    push(`${fmt(lineWidth)} w ${fmt(x)} ${fmt(y)} ${fmt(width)} ${fmt(height)} re B`);
    return;
  }

  if (fillColor) {
    setFillColor(fillColor);
    push(`${fmt(x)} ${fmt(y)} ${fmt(width)} ${fmt(height)} re f`);
    return;
  }

  if (strokeColor) {
    setStrokeColor(strokeColor);
    push(`${fmt(lineWidth)} w ${fmt(x)} ${fmt(y)} ${fmt(width)} ${fmt(height)} re S`);
  }
}

function drawLine(x1, y1, x2, y2, { width = 1, color = COLORS.line } = {}) {
  setStrokeColor(color);
  push(`${fmt(width)} w ${fmt(x1)} ${fmt(y1)} m ${fmt(x2)} ${fmt(y2)} l S`);
}

function drawText(text, x, y, { font = "F1", size = 12, color = COLORS.ink } = {}) {
  setFillColor(color);
  push(`BT /${font} ${size} Tf 1 0 0 1 ${fmt(x)} ${fmt(y)} Tm (${escapePdfText(text)}) Tj ET`);
}

function drawWrappedText(text, x, y, width, { font = "F1", size = 12, color = COLORS.ink, leading = size + 3 } = {}) {
  const lines = wrapText(text, width, size, font);
  lines.forEach((line, index) => {
    drawText(line, x, y - (index * leading), { font, size, color });
  });
  return y - (lines.length * leading);
}

function drawBulletList(items, x, y, width, { size = 11, color = COLORS.ink, leading = 14 } = {}) {
  let cursor = y;
  items.forEach((item) => {
    cursor = drawWrappedText(`- ${item}`, x, cursor, width, { size, color, leading });
  });
  return cursor;
}

function ensureOutputDirectory() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
}

drawRect(0, 654, PAGE.width, 188, { fillColor: COLORS.brand });
drawRect(0, 642, PAGE.width, 12, { fillColor: COLORS.brandDark });
drawRect(0, 0, PAGE.width, 642, { fillColor: COLORS.white });

drawText("SOCIALRAVEN", 42, 798, { font: "F2", size: 11, color: COLORS.white });
drawText("Agency Custom Pricing Sheet", 42, 764, { font: "F2", size: 28, color: COLORS.white });
drawWrappedText(
  "Pricing for agencies operating above the Agency Pro workspace limit.",
  42,
  739,
  420,
  { size: 12, color: COLORS.headerTint, leading: 15 }
);
drawText("Updated April 13, 2026", 420, 798, { size: 10, color: COLORS.headerTint });

drawRect(42, 522, 511, 112, {
  fillColor: COLORS.brandSoft,
  strokeColor: COLORS.brandBorder,
  lineWidth: 1,
});
drawRect(42, 522, 8, 112, { fillColor: COLORS.brand });
drawLine(320, 540, 320, 616, { color: COLORS.brandBorder });

drawText("BASE CUSTOM PRICING", 60, 609, { font: "F2", size: 11, color: COLORS.brand });
drawText("$300 / month", 60, 575, { font: "F2", size: 29, color: COLORS.ink });
drawText("Includes 30 workspaces", 60, 552, { size: 11, color: COLORS.muted });

drawText("PRICING FORMULA", 338, 609, { font: "F2", size: 11, color: COLORS.brand });
drawText("30 workspaces = $300", 338, 582, { font: "F2", size: 15, color: COLORS.ink });
drawText("Each additional workspace: +$3 / month", 338, 559, { size: 11, color: COLORS.muted });

drawRect(42, 296, 246, 192, {
  fillColor: COLORS.panel,
  strokeColor: COLORS.line,
  lineWidth: 1,
});
drawRect(306, 296, 247, 192, {
  fillColor: COLORS.panel,
  strokeColor: COLORS.line,
  lineWidth: 1,
});

drawText("Pricing Model", 60, 462, { font: "F2", size: 14, color: COLORS.brandDark });
drawBulletList(pricingBullets, 60, 438, 206, { size: 11, color: COLORS.ink, leading: 15 });

drawText("Provider Limits", 324, 462, { font: "F2", size: 14, color: COLORS.brandDark });
drawBulletList(providerBullets, 324, 438, 207, { size: 11, color: COLORS.ink, leading: 15 });

drawRect(42, 158, 511, 118, {
  fillColor: COLORS.brandSoft,
  strokeColor: COLORS.brandBorder,
  lineWidth: 1,
});
drawLine(336, 176, 336, 252, { color: COLORS.brandBorder });

drawText("Billing Notes", 60, 248, { font: "F2", size: 13, color: COLORS.brandDark });
drawBulletList(billingBullets, 60, 226, 244, { size: 10, color: COLORS.ink, leading: 13 });

drawText("Contact", 354, 248, { font: "F2", size: 13, color: COLORS.brandDark });
drawText("team+sales@socialraven.io", 354, 224, { size: 10, color: COLORS.ink });
drawText("https://socialraven.io/pricing", 354, 208, { size: 10, color: COLORS.ink });
drawText("SR-AGENCY-CUSTOM-2026-04-13-B", 354, 192, { size: 10, color: COLORS.muted });

const content = `${ops.join("\n")}\n`;

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}endstream`,
];

let pdf = "%PDF-1.4\n";
const offsets = [0];

objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
});

const xrefOffset = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";

offsets.slice(1).forEach((offset) => {
  pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
});

pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

ensureOutputDirectory();
fs.writeFileSync(OUTPUT_PATH, Buffer.from(pdf, "utf8"));
console.log(`Wrote ${OUTPUT_PATH}`);
