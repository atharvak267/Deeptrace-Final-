from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io

def create_pdf_report(report_text):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    Story = []
    
    Story.append(Paragraph("DeepTrace Forensic Evidence Report", styles['Title']))
    Story.append(Spacer(1, 12))
    
    for paragraph in report_text.split('\n\n'):
        if paragraph.strip():
            Story.append(Paragraph(paragraph.replace('\n', '<br/>'), styles['Normal']))
            Story.append(Spacer(1, 12))
            
    doc.build(Story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
