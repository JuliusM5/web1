// This implementation requires the jspdf library
// npm install jspdf jspdf-autotable

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './settingsUtils';

// Calculate trip duration in days
function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.abs(end - start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Generate and download a PDF for a trip
export const generateTripPDF = (trip, userSettings) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Trip to ${trip.destination}`,
    subject: `Travel itinerary for ${trip.destination}`,
    author: 'TravelEase',
    keywords: 'travel, itinerary, trip planning',
    creator: 'TravelEase Application'
  });
  
  // Add title
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text(`Trip to ${trip.destination}`, 105, 20, { align: 'center' });
  
  // Add dates
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  const dateText = `${trip.startDate} to ${trip.endDate} (${calculateDuration(trip.startDate, trip.endDate)} days)`;
  doc.text(dateText, 105, 30, { align: 'center' });
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  let yPosition = 45;
  
  // Trip Overview Section
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('Trip Overview', 20, yPosition);
  yPosition += 10;
  
  // Trip details
  doc.setFontSize(12);
  doc.text(`Destination: ${trip.destination}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Duration: ${calculateDuration(trip.startDate, trip.endDate)} days`, 25, yPosition);
  yPosition += 7;
  doc.text(`Budget: ${formatCurrency(trip.budget, userSettings)}`, 25, yPosition);
  yPosition += 15;
  
  // Local Information Section (if available)
  if (trip.info) {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Local Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Emergency Contact: ${trip.info.emergency}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Currency: ${trip.info.currency}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Language: ${trip.info.language}`, 25, yPosition);
    yPosition += 7;
    
    // Handle phrases which might be long
    const phrases = `Useful Phrases: ${trip.info.phrases}`;
    const phrasesLines = doc.splitTextToSize(phrases, 170);
    doc.text(phrasesLines, 25, yPosition);
    yPosition += phrasesLines.length * 7 + 8;
  }
  
  // Transportation Section (if available)
  if (trip.transports && trip.transports.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Transportation', 20, yPosition);
    yPosition += 10;
    
    // Create table for transportation
    const transportTableData = trip.transports.map(t => [
      t.type,
      t.from,
      t.to,
      t.price ? formatCurrency(t.price, userSettings) : 'N/A'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Type', 'From', 'To', 'Price']],
      body: transportTableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 25 },
      width: 160
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Check if we need a new page for tasks
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Tasks Section (if available)
  if (trip.tasks && trip.tasks.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Tasks & To-Do List', 20, yPosition);
    yPosition += 10;
    
    // Create table for tasks
    const taskTableData = trip.tasks.map(task => [
      task.completed ? '✓' : '○',
      task.text,
      task.date || 'N/A',
      task.priority || 'Medium'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Status', 'Task', 'Date', 'Priority']],
      body: taskTableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 25 },
      width: 160
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Check if we need a new page for notes
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Notes Section (if available)
  if (trip.notes && trip.notes.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Notes', 20, yPosition);
    yPosition += 10;
    
    // Create table for notes
    const noteTableData = trip.notes.map(note => [
      note.title,
      note.text,
      note.category || 'General'
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Title', 'Content', 'Category']],
      body: noteTableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 25 },
      width: 160
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Check if we need a new page for budget
  if (yPosition > 230 && trip.budgetBreakdown) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Budget Breakdown (if available)
  if (trip.budgetBreakdown) {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Budget Breakdown', 20, yPosition);
    yPosition += 10;
    
    // Create table for budget
    const categories = Object.keys(trip.budgetBreakdown);
    const budgetTableData = categories.map(category => [
      category.charAt(0).toUpperCase() + category.slice(1),
      formatCurrency(trip.budgetBreakdown[category], userSettings)
    ]);
    
    const totalBudget = Object.values(trip.budgetBreakdown).reduce((sum, val) => sum + val, 0);
    budgetTableData.push(['Total', formatCurrency(totalBudget, userSettings)]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Category', 'Amount']],
      body: budgetTableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: 25 },
      width: 160,
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      didDrawCell: (data) => {
        // Add highlight to the total row
        if (data.row.index === budgetTableData.length - 1) {
          doc.setFillColor(240, 240, 240);
          doc.setTextColor(0, 0, 0);
          doc.setFontStyle('bold');
        }
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  const footerText = `Generated by TravelEase on ${new Date().toLocaleDateString()}`;
  doc.text(footerText, 105, 280, { align: 'center' });
  
  // Save the PDF with a filename based on the destination
  const sanitizedDestination = trip.destination.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `trip_to_${sanitizedDestination}.pdf`;
  
  doc.save(filename);
  
  return true;
};

// A simplified version that doesn't require the jsPDF library, for fallback
export const fallbackExportTripToPDF = (trip) => {
  // Generate printable HTML
  const html = generatePrintableHTML(trip);
  
  // Create blob and download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Download as HTML (user can print to PDF)
  const a = document.createElement('a');
  a.href = url;
  a.download = `Trip_to_${trip.destination.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
  
  return true;
};

// HTML template for fallback method
function generatePrintableHTML(trip) {
  return `
    <html>
      <head>
        <title>Trip to ${trip.destination}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #3b82f6; }
          h2 { color: #1e40af; margin-top: 20px; }
          .section { margin-bottom: 20px; }
          .date { color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
          @media print {
            .no-print { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()">Print</button>
        </div>
        
        <h1>Trip to ${trip.destination}</h1>
        <p class="date">${trip.startDate} to ${trip.endDate} (${calculateDuration(trip.startDate, trip.endDate)} days)</p>
        
        <div class="section">
          <h2>Trip Overview</h2>
          <p><strong>Budget:</strong> $${trip.budget}</p>
        </div>
        
        ${trip.info ? `
        <div class="section">
          <h2>Local Information</h2>
          <p><strong>Emergency:</strong> ${trip.info.emergency}</p>
          <p><strong>Currency:</strong> ${trip.info.currency}</p>
          <p><strong>Language:</strong> ${trip.info.language}</p>
          <p><strong>Useful Phrases:</strong> ${trip.info.phrases}</p>
        </div>
        ` : ''}
        
        ${trip.transports && trip.transports.length > 0 ? `
        <div class="section">
          <h2>Transportation</h2>
          <table>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Price</th>
            </tr>
            ${trip.transports.map(t => `
            <tr>
              <td>${t.type}</td>
              <td>${t.from}</td>
              <td>${t.to}</td>
              <td>${t.price ? '$' + t.price : 'N/A'}</td>
            </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}
        
        ${trip.tasks && trip.tasks.length > 0 ? `
        <div class="section">
          <h2>Tasks & Checklist</h2>
          <table>
            <tr>
              <th>Status</th>
              <th>Task</th>
              <th>Date</th>
              <th>Priority</th>
            </tr>
            ${trip.tasks.map(task => `
            <tr>
              <td>${task.completed ? '✓' : '○'}</td>
              <td>${task.text}</td>
              <td>${task.date || 'N/A'}</td>
              <td>${task.priority || 'Medium'}</td>
            </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}
        
        ${trip.notes && trip.notes.length > 0 ? `
        <div class="section">
          <h2>Notes</h2>
          ${trip.notes.map(note => `
          <div style="margin-bottom: 10px;">
            <h3>${note.title}</h3>
            <p>${note.text}</p>
          </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Generated by TravelEase on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
    </html>
  `;
}

// Main export function that decides which method to use
export const exportTripToPDF = (trip, userSettings) => {
  try {
    // Try to use jsPDF if available
    if (typeof jsPDF !== 'undefined') {
      const success = generateTripPDF(trip, userSettings);
      if (success) {
        return true;
      }
    }
    
    // Fallback to HTML method
    console.log('Using fallback HTML export method');
    return fallbackExportTripToPDF(trip);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Still try the fallback method
    try {
      return fallbackExportTripToPDF(trip);
    } catch (fallbackError) {
      console.error('Fallback export also failed:', fallbackError);
      alert(`There was an issue generating the PDF for ${trip.destination}. Please try again later.`);
      return false;
    }
  }
};