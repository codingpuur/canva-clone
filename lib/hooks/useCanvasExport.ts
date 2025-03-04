"use client";

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function useCanvasExport() {
  const exportToImage = async (elementId: string, fileName: string = 'canvas-export.png') => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
      }
      
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: null,
      });
      
      // Convert to image and download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      
      return dataUrl;
    } catch (error) {
      console.error('Error exporting canvas to image:', error);
      throw error;
    }
  };
  
  const exportToPDF = async (elementId: string, fileName: string = 'canvas-export.pdf') => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error exporting canvas to PDF:', error);
      throw error;
    }
  };
  
  const exportMultiPagePDF = async (pageElementIds: string[], fileName: string = 'canvas-export.pdf') => {
    try {
      if (pageElementIds.length === 0) {
        throw new Error('No pages to export');
      }
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
      });
      
      for (let i = 0; i < pageElementIds.length; i++) {
        const elementId = pageElementIds[i];
        const element = document.getElementById(elementId);
        
        if (!element) {
          console.warn(`Element with ID "${elementId}" not found, skipping...`);
          continue;
        }
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Add new page for all pages except the first one
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate dimensions to fit the page
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
        const width = canvas.width * ratio;
        const height = canvas.height * ratio;
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, width, height);
      }
      
      pdf.save(fileName);
      return true;
    } catch (error) {
      console.error('Error exporting canvas to multi-page PDF:', error);
      throw error;
    }
  };
  
  return {
    exportToImage,
    exportToPDF,
    exportMultiPagePDF,
  };
}