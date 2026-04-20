import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, TabStopType } from 'docx';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { workout, athleteName, poolType, date, quote } = req.body;
    if (!workout || !workout.sections) {
      return res.status(400).json({ error: 'workout data required' });
    }

    const gold = 'B8956A';
    const ink = '121212';
    const muted = '888888';
    const rule = 'D0D0D0';

    const children = [];

    // Header: Confluence Swim + athlete/date on right using tab stops
    children.push(new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Confluence Swim', font: 'Georgia', size: 28, bold: true, color: ink }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: athleteName || '', font: 'Arial', size: 20, bold: true, color: ink }),
      ],
    }));
    children.push(new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: rule } },
      children: [
        new TextRun({ text: '', font: 'Arial', size: 16 }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: `${date || ''} · ${poolType || ''}`, font: 'Arial', size: 16, color: muted }),
      ],
    }));

    // Workout title
    if (workout.title) {
      children.push(new Paragraph({
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({ text: workout.title, font: 'Georgia', size: 24, bold: true, color: ink }),
        ],
      }));
    }

    // Sections
    let grandTotal = 0;
    for (const section of workout.sections) {
      let sectionYards = 0;
      for (const entry of (section.entries || [])) {
        sectionYards += (entry.reps || 0) * (entry.distance || 0);
      }
      grandTotal += sectionYards;

      // Section header
      const sectionLabel = section.title
        ? `${section.label} — ${section.title} · ${sectionYards.toLocaleString()} yds`
        : `${section.label} · ${sectionYards.toLocaleString()} yds`;

      children.push(new Paragraph({
        spacing: { before: 200, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: rule } },
        children: [
          new TextRun({ text: sectionLabel.toUpperCase(), font: 'Arial', size: 16, bold: true, color: gold, characterSpacing: 60 }),
        ],
      }));

      // Entries
      for (const entry of (section.entries || [])) {
        const parts = [];

        // Main line: 4×100 Free — White @ 1:30
        let mainLine = '';
        if (entry.reps && entry.distance) {
          mainLine += `${entry.reps}×${entry.distance}`;
        } else if (entry.distance) {
          mainLine += `${entry.distance}`;
        }
        if (entry.stroke) mainLine += ` ${entry.stroke}`;
        if (entry.effort) mainLine += ` — ${entry.effort}`;
        if (entry.interval) mainLine += ` @ ${entry.interval}`;

        parts.push(new TextRun({ text: mainLine, font: 'Arial', size: 20, color: ink }));

        // Equipment in italic
        if (entry.equipment && entry.equipment.length > 0) {
          parts.push(new TextRun({ text: `  · ${entry.equipment.join(', ')}`, font: 'Arial', size: 18, italics: true, color: muted }));
        }

        children.push(new Paragraph({
          spacing: { before: 40, after: 0 },
          children: parts,
        }));

        // Description if present
        if (entry.description) {
          children.push(new Paragraph({
            spacing: { before: 0, after: 0 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: entry.description, font: 'Arial', size: 18, color: muted, italics: true }),
            ],
          }));
        }

        // Time slots if enabled
        if (entry.showTimes && entry.reps) {
          const timeLabels = [];
          for (let i = 1; i <= entry.reps; i++) {
            timeLabels.push(`#${i} ______`);
            if (entry.showSplits) {
              timeLabels[timeLabels.length - 1] += '/______';
            }
          }
          children.push(new Paragraph({
            spacing: { before: 20, after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: timeLabels.join('    '), font: 'Courier New', size: 16, color: muted }),
            ],
          }));
        }
      }
    }

    // Total yardage
    children.push(new Paragraph({
      spacing: { before: 300, after: 100 },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: rule }, bottom: { style: BorderStyle.SINGLE, size: 1, color: rule } },
      tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
      children: [
        new TextRun({ text: 'TOTAL YARDAGE', font: 'Arial', size: 16, bold: true, color: muted, characterSpacing: 60 }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: grandTotal.toLocaleString(), font: 'Georgia', size: 28, bold: true, color: ink }),
      ],
    }));

    // Quote
    if (quote) {
      children.push(new Paragraph({
        spacing: { before: 200 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `"${quote.text}"`, font: 'Georgia', size: 18, italics: true, color: muted }),
          new TextRun({ text: ` — ${quote.author}`, font: 'Arial', size: 16, color: muted }),
        ],
      }));
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="workout.docx"`);
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error('Workout doc error:', err);
    res.status(500).json({ error: err.message });
  }
}
