/**
 * src/lib/downloadPDF.js
 * Captures the dashboard and exports it as a properly formatted PDF report.
 * Depends on: jspdf, html2canvas (add both via: npm install jspdf html2canvas)
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function downloadDashboardPDF({ role, stressScore, scenario }) {
  const element = document.getElementById('dashboard-report')
  if (!element) {
    console.error('[OpsPulse] No element with id="dashboard-report" found.')
    return
  }

  const btn = document.getElementById('pdf-download-btn')
  const originalHTML = btn?.innerHTML
  if (btn) {
    btn.disabled = true
    btn.innerHTML = '<span>Generating PDF…</span>'
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#080c14',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const margin = 10
    const usableW = pageW - margin * 2
    const headerH = 24
    const footerH = 8
    const firstPageContentH = pageH - headerH - footerH - margin
    const otherPageContentH = pageH - margin * 2 - footerH

    // Page 1 background
    pdf.setFillColor(8, 12, 20)
    pdf.rect(0, 0, pageW, pageH, 'F')

    // Header strip
    pdf.setFillColor(13, 21, 38)
    pdf.rect(0, 0, pageW, headerH, 'F')

    pdf.setTextColor(0, 229, 255)
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'bold')
    pdf.text('OpsPulse — Business Health Report', margin, 11)

    pdf.setTextColor(74, 96, 128)
    pdf.setFontSize(7.5)
    pdf.setFont('helvetica', 'normal')
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    const roleLabel = role === 'owner' ? 'Business Owner View' : 'Operations Manager View'
    const scenarioLabel = scenario.charAt(0).toUpperCase() + scenario.slice(1)
    pdf.text(roleLabel + '  ·  Scenario: ' + scenarioLabel + '  ·  Generated: ' + now, margin, 17)

    const score = stressScore?.overall ?? null
    const scoreColorRGB =
      score === null ? [74, 96, 128] :
      score <= 25    ? [0, 255, 136] :
      score <= 50    ? [0, 229, 255] :
      score <= 70    ? [255, 184, 0] :
      score <= 85    ? [255, 122, 0] : [255, 59, 92]
    const scoreLabel =
      score === null  ? 'Loading'  :
      score <= 25     ? 'Healthy'  :
      score <= 50     ? 'Stable'   :
      score <= 70     ? 'Caution'  :
      score <= 85     ? 'Stressed' : 'Critical'

    pdf.setFillColor(...scoreColorRGB)
    pdf.roundedRect(pageW - margin - 30, 3, 30, 18, 3, 3, 'F')
    pdf.setTextColor(8, 12, 20)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text(score !== null ? String(score) : '-', pageW - margin - 15, 11, { align: 'center' })
    pdf.setFontSize(7)
    pdf.text(scoreLabel, pageW - margin - 15, 17, { align: 'center' })

    const imgW = canvas.width
    const imgH = canvas.height
    const pxPerMm = imgW / usableW
    const firstSlicePx = firstPageContentH * pxPerMm
    const otherSlicePx = otherPageContentH * pxPerMm

    let srcY = 0
    let pageNum = 0

    while (srcY < imgH) {
      const isFirstPage = pageNum === 0
      const sliceMaxPx = isFirstPage ? firstSlicePx : otherSlicePx
      const sliceH = Math.min(sliceMaxPx, imgH - srcY)
      const destY = isFirstPage ? headerH : margin

      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = imgW
      sliceCanvas.height = Math.ceil(sliceH)
      const ctx = sliceCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, srcY, imgW, sliceCanvas.height, 0, 0, imgW, sliceCanvas.height)

      const sliceImg = sliceCanvas.toDataURL('image/png')
      const sliceDisplayH = sliceCanvas.height / pxPerMm
      pdf.addImage(sliceImg, 'PNG', margin, destY, usableW, sliceDisplayH)

      // Footer
      pdf.setTextColor(74, 96, 128)
      pdf.setFontSize(6.5)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        "OpsPulse · HORIZON 1.0 · Vidyavardhini's College of Engineering & Technology · Demo Mode",
        pageW / 2, pageH - 3, { align: 'center' }
      )
      pdf.text('Page ' + (pageNum + 1), pageW - 12, pageH - 3)

      srcY += sliceH
      pageNum++

      if (srcY < imgH) {
        pdf.addPage()
        pdf.setFillColor(8, 12, 20)
        pdf.rect(0, 0, pageW, pageH, 'F')
      }
    }

    const safeRole = roleLabel.replace(/\s+/g, '_')
    const ts = new Date().toISOString().slice(0, 10)
    pdf.save('OpsPulse_' + safeRole + '_' + ts + '.pdf')

  } catch (err) {
    console.error('[OpsPulse] PDF generation failed:', err)
    alert('PDF generation failed. Please try again.')
  } finally {
    if (btn && originalHTML) {
      btn.disabled = false
      btn.innerHTML = originalHTML
    }
  }
}
