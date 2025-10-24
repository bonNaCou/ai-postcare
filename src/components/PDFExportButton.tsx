"use client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";



export default function PDFExportButton({ targetId }: { targetId: string }) {
  const { t } = useTranslation();
  async function exportPDF() {
  const el = document.getElementById(targetId);
  if (!el) return;
  const canvas = await html2canvas(el);
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  pdf.addImage(img, "PNG", 0, 0, 210, 297);
  pdf.save("AI_PostCare_Report.pdf");
  }

  return (
    <button
      onClick={exportPDF}
      className="w-full bg-purple-100 border border-purple-300 text-purple-700 py-2 rounded-md hover:bg-purple-200 transition"
>
      Download PDF
    </button>
  );
}
