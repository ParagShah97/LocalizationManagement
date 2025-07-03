from fastapi import Request, HTTPException
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # use service key (not anon)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def get_current_user(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth.split(" ")[1]

    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise HTTPException(status_code=401, detail="Invalid user token")

        return response.user

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
