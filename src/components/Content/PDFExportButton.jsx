import React from 'react';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Button } from '../UI/Button.jsx';

// Exports a simple text-based PDF. For rich rendering, consider html2canvas+jsPDF.
export default function PDFExportButton({ title, body, filename = 'note.pdf' }) {
  function handleExport() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 36;
    const maxWidth = 523; // 595 - margins
    const content = `# ${title}\n\n${body}`;
    const lines = doc.splitTextToSize(content, maxWidth);
    doc.text(lines, margin, margin + 12);
    doc.save(filename);
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm" title="Export as PDF">
      <FileDown size={16} className="mr-2" />
      Export PDF
    </Button>
  );
}
