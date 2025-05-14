import pdfkit
import os

config = pdfkit.configuration(
    wkhtmltopdf=os.path.abspath("D:/Personale/BITSTONE CONTEST/wkhtmltopdf/bin/wkhtmltopdf.exe")
)

def generate_pdf(detections, suggestions, address):
    os.makedirs("reports", exist_ok=True)
    items = "".join(f"<li>{d['label']} ({d['confidence']:.2f})</li>" for d in detections)

    html = f"""
    <h1>Urban Maintenance Report</h1>
    <p><strong>Location:</strong> {address}</p>
    <h2>Detected Issues:</h2>
    <ul>{items}</ul>
    <h2>Suggested Actions:</h2>
    <p>{suggestions}</p>
    """

    filename = "report.pdf"
    filepath = os.path.join("reports", filename)
    pdfkit.from_string(html, filepath, configuration=config)
    return filename
