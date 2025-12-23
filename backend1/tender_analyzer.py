import os
import re
import json
import logging
import PyPDF2

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# -------------------------------
# Tender parsing (NO AI)
# -------------------------------
def extract_tender_specs(tender_text):
    logger.info("Using fallback tender parser")

    quantity = re.search(r"Quantity[:\s]*(\d+)", tender_text, re.I)
    ram = re.search(r"(\d+)\s*GB\s*RAM", tender_text, re.I)
    storage = re.search(r"(\d+)\s*GB\s*SSD", tender_text, re.I)
    cpu = re.search(r"(i[3579])", tender_text, re.I)

    specs = {
        "item": "Laptop",
        "quantity": int(quantity.group(1)) if quantity else 0,
        "processor": f"Intel {cpu.group(1)}" if cpu else "Unknown",
        "ram": ram.group(0) if ram else "Unknown",
        "storage": storage.group(0) if storage else "Unknown",
    }

    logger.info(f"Tender specs extracted: {specs}")
    return specs


# -------------------------------
# Bid PDF parsing
# -------------------------------
def extract_bid_specs(pdf_path):
    specs = {
        "filename": os.path.basename(pdf_path),
        "quantity": None,
        "processor": None,
        "ram": None,
        "storage": None,
        "rawText": ""
    }

    try:
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            text = "\n".join(page.extract_text() or "" for page in reader.pages)

        specs["rawText"] = text

        q = re.search(r"Quantity[:\s]*(\d+)", text, re.I)
        if q:
            specs["quantity"] = int(q.group(1))

        cpu = re.search(r"(i[3579])", text, re.I)
        if cpu:
            specs["processor"] = f"Intel {cpu.group(1)}"

        ram = re.search(r"(\d+)\s*GB\s*RAM", text, re.I)
        if ram:
            specs["ram"] = ram.group(0)

        storage = re.search(r"(\d+)\s*GB\s*SSD", text, re.I)
        if storage:
            specs["storage"] = storage.group(0)

        logger.info(f"Parsed bid specs from {specs['filename']}")

    except Exception as e:
        logger.warning(f"Failed to parse PDF {pdf_path}: {e}")

    return specs


# -------------------------------
# Bid selection logic (NO AI)
# -------------------------------
def select_best_bid(tender, bids):
    logger.info("Selecting best bid using rule-based logic")

    qualified = []
    best = None

    for bid in bids.values():
        if bid["quantity"] == tender["quantity"]:
            qualified.append(bid)

    if qualified:
        best = qualified[0]
    else:
        best = next(iter(bids.values()))

    result = {
        "qualified_bids": len(qualified),
        "best_bid": best["filename"],
        "best_specs": best
    }

    logger.info(f"Bid selection result: {result}")
    return result


# -------------------------------
# Main pipeline
# -------------------------------
def process_bids(tender_text, pdf_dir):
    logger.info("========== PROCESS_BIDS START ==========")
    logger.info(f"Tender text: {tender_text}")
    logger.info(f"PDF directory: {pdf_dir}")

    try:
        tender = extract_tender_specs(tender_text)

        pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]
        logger.info(f"Files found: {pdf_files}")

        if not pdf_files:
            raise ValueError("No PDF bids found")

        bids = {
            f: extract_bid_specs(os.path.join(pdf_dir, f))
            for f in pdf_files
        }

        result = select_best_bid(tender, bids)
        logger.info("========== PROCESS_BIDS SUCCESS ==========")

        return result

    except Exception as e:
        logger.critical(f"PROCESS_BIDS FAILED: {e}")
        return {"error": str(e)}
