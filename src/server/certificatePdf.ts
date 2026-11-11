import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import { P12Signer } from "@signpdf/signer-p12";
import signpdf from "@signpdf/signpdf";
import { ApiError } from "@/server/api";

type IssuedCertificate = {
  certificateNumber: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  completedAt: string;
  skills: unknown[];
};

const navy = rgb(0.09, 0.13, 0.2);
const orange = rgb(1, 0.42, 0.21);
const muted = rgb(0.38, 0.44, 0.53);
const FONT_ROOT = join(process.cwd(), "node_modules", "@fontsource");

export async function createSignedCertificatePdf(certificate: IssuedCertificate, origin: string): Promise<Buffer> {
  const keyPath = process.env.CERTIFICATE_SIGNING_P12_PATH;
  const passphrase = process.env.CERTIFICATE_SIGNING_P12_PASSWORD;
  if (!keyPath || !passphrase) {
    throw new ApiError(503, "CERTIFICATE_SIGNING_UNAVAILABLE", "Digitally signed certificates are being configured. Please try again later.");
  }
  let p12: Buffer;
  try { p12 = await readFile(keyPath); }
  catch { throw new ApiError(503, "CERTIFICATE_SIGNING_UNAVAILABLE", "Digitally signed certificates are temporarily unavailable."); }

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const [latinBytes, tamilBytes] = await Promise.all([
    readFile(join(FONT_ROOT, "noto-sans", "files", "noto-sans-latin-400-normal.woff")),
    readFile(join(FONT_ROOT, "noto-sans-tamil", "files", "noto-sans-tamil-tamil-400-normal.woff")),
  ]);
  const latin = await pdf.embedFont(latinBytes, { subset: true });
  const tamil = await pdf.embedFont(tamilBytes, { subset: true });
  const logo = await pdf.embedPng(await readFile(join(process.cwd(), "public", "branding", "elevate-orange-ribbon-logo.png")));
  const latinGlyphs = fontkit.create(latinBytes);
  const tamilGlyphs = fontkit.create(tamilBytes);
  const page = pdf.addPage([842, 595]);
  const width = page.getWidth();
  page.drawRectangle({ x: 0, y: 0, width, height: 595, color: rgb(1, 0.995, 0.98) });
  page.drawRectangle({ x: 24, y: 24, width: 794, height: 547, borderColor: navy, borderWidth: 7 });
  page.drawRectangle({ x: 37, y: 37, width: 768, height: 521, borderColor: orange, borderWidth: 1.5 });

  const runs = (value: string) => {
    const parts: Array<{ text: string; font: typeof latin }> = [];
    for (const character of value) {
      const useTamil = /[\u0B80-\u0BFF]/u.test(character);
      const font = useTamil ? tamil : latin;
      const glyphs = useTamil ? tamilGlyphs : latinGlyphs;
      const text = glyphs.hasGlyphForCodePoint(character.codePointAt(0) || 0) ? character : " ";
      const previous = parts.at(-1);
      if (previous?.font === font) previous.text += text;
      else parts.push({ text, font });
    }
    return parts;
  };
  const measure = (value: string, size: number) => runs(value).reduce((sum, part) => sum + part.font.widthOfTextAtSize(part.text, size), 0);
  const drawCentered = (value: string, y: number, size: number, color = navy, maxWidth = 700) => {
    const text = value.trim() || "—";
    const actualSize = Math.max(11, Math.min(size, size * maxWidth / Math.max(1, measure(text, size))));
    const x = (width - measure(text, actualSize)) / 2;
    let cursor = x;
    for (const part of runs(text)) {
      page.drawText(part.text, { x: cursor, y, size: actualSize, font: part.font, color });
      cursor += part.font.widthOfTextAtSize(part.text, actualSize);
    }
  };

  page.drawImage(logo, { x: (width - 147) / 2, y: 492, width: 147, height: 44 });
  drawCentered("CERTIFICATE OF COMPLETION", 451, 27);
  drawCentered("This certificate is presented to", 410, 13, muted);
  drawCentered(certificate.studentName, 363, 32);
  page.drawLine({ start: { x: 190, y: 347 }, end: { x: 652, y: 347 }, color: orange, thickness: 1.5 });
  drawCentered("for completing the course", 320, 13, muted);
  drawCentered(certificate.courseName, 282, 22, navy, 690);
  const completed = new Date(certificate.completedAt);
  const date = Number.isNaN(completed.valueOf()) ? certificate.completedAt : completed.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  drawCentered(`Completed ${date}`, 245, 12, muted);
  const skills = certificate.skills.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, 5);
  if (skills.length) drawCentered(`Skills: ${skills.join("  |  ")}`, 213, 10, muted, 680);

  page.drawLine({ start: { x: 79, y: 173 }, end: { x: 306, y: 173 }, color: muted, thickness: 0.6 });
  page.drawLine({ start: { x: 536, y: 173 }, end: { x: 763, y: 173 }, color: muted, thickness: 0.6 });
  drawCentered("Digitally signed by Elevate", 145, 12, orange);
  drawCentered(`Instructor: ${certificate.instructorName}`, 124, 10, muted);
  drawCentered(`Certificate ID: ${certificate.certificateNumber}`, 99, 11);
  drawCentered(`Verify: ${origin}/certificates/verify/${encodeURIComponent(certificate.certificateNumber)}`, 77, 9, muted, 700);

  pdf.setTitle(`Elevate Certificate ${certificate.certificateNumber}`);
  pdf.setAuthor("Elevate");
  pdf.setSubject(`Course completion certificate for ${certificate.studentName}`);
  pdflibAddPlaceholder({
    pdfDoc: pdf,
    reason: "Elevate course completion certificate",
    contactInfo: "",
    name: "Elevate",
    location: "India",
    appName: "Elevate LMS",
    signatureLength: 32768,
  });
  try {
    const signer = new P12Signer(p12, { passphrase });
    return await signpdf.sign(Buffer.from(await pdf.save()), signer);
  } catch (error) {
    console.error("Certificate signing failed", error instanceof Error ? error.message : "unknown error");
    throw new ApiError(503, "CERTIFICATE_SIGNING_UNAVAILABLE", "Digitally signed certificates are temporarily unavailable.");
  }
}
