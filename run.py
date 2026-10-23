import os
from dotenv import load_dotenv

load_dotenv()

from api.index import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Starting CJJWEEL Luxury Jewellery Flask Server on http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=True)
