#!/usr/bin/env python3
"""
Production run script. Reads PORT from environment (default 10000) and runs the ASGI app.
Use this for Render or: uvicorn app.main:app --host 0.0.0.0 --port $PORT
"""
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level=os.environ.get("LOG_LEVEL", "info").lower(),
    )
