# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import tempfile
from tender_analyzer import process_bids  # We'll update this import
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app)

@app.route('/api/analyze-bids', methods=['POST'])
def analyze_bids():
    try:
        print("FORM KEYS:", list(request.form.keys()))
        print("FILES KEYS:", list(request.files.keys()))
        print("FILES COUNT:", len(request.files.getlist("bids")))
        if 'requirements' not in request.form:
            return jsonify({
                'success': False,
                'message': 'Tender requirements not provided'
            }), 400

        if 'bids' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No bid files uploaded'
            }), 400

        requirements_text = request.form['requirements']

        # Create a temporary directory for PDF files
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded files
            bid_files = []
            for file in request.files.getlist('bids'):
                if file.filename:
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(temp_dir, filename)
                    file.save(file_path)
                    bid_files.append(filename)

            # Process bids using Gemini API
            result = process_bids(requirements_text, temp_dir)

            if 'error' in result:
                return jsonify({
                    'success': False,
                    'message': result['error']
                }), 400

            return jsonify({
                'success': True,
                'data': {
                    'requirements': result.get('tender', {}),  # Gemini-extracted tender specs
                    'bestBid': {
                        'filename': result.get('best_bid'),
                        **result.get('best_specs', {})
                    },
                    'qualifiedBids': result.get('qualified_bids', 0)
                }
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=4000)