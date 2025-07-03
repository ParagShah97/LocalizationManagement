from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import uuid
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from .auth import get_current_user
import csv
from io import StringIO

# What are the improvement can be made
# 1. We can use SQLAlchemy to add the ORM rather directly calling SQL APIs.
# 2. Seperate file for all the models (POJOs).
# 3. Add new language support: All the keys present in the DB for all other languages will be
#    available for new languages as well with an empty field.
# 4. Add new project: Here need to add new entry to the project table, all the added key will have
#    new project_id.)
# 5. Add support for multiple file type like (.xlsx, XML, JSON).

load_dotenv()

app = FastAPI()

# Connect to Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# BaseModel - it gives classes superpowers like validation and type coercion.
class AddRequest(BaseModel):
    key: str
    value: str
    language: str
    category: str
    description: str = ""
    updated_by: str 

class UpdateRequest(BaseModel):
    key: str
    value: str
    description: str
    language: str
    updated_by: str


# Resolve CORS issue 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for now keeping *
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API call to get the user information (like email) after validating the token.
@app.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    return {"user": user.email}

# GET localization: return all the projects and supported languages.
@app.get("/localizations/")
async def get_projects_and_langs(user=Depends(get_current_user)):
    try:
        projects = supabase.table('projects').select("*").execute()
        langs = supabase.table('language_store').select("*").execute()

        return {"projects": projects.data, "languages":langs.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

## This is the endpoint to get the localizations for a project and locale
## It returns a JSON object with the localizations for the project and locale
## It will take project_id and locale as path parameter.
@app.get("/localizations/{project_id}/{locale}")
async def get_localizations(project_id: str, locale: str, user=Depends(get_current_user)):
    # return {"project_id": project_id, "locale": locale, "localizations": {"greeting": "Hello", "farewell": "Goodbye"}}
    try:
        # Step 1: Get all translation keys
        keys_res = supabase.table("translation_keys").select("*").eq("project_id", project_id).execute()
        keys = keys_res.data
        

        # Step 2: Get translations for the locale
        translations_res = supabase.table("translations").select("*").eq("language_code", locale).eq("project_id", project_id).execute()
        translations = translations_res.data

        # Step 3: Organize data as per TranslationKey interface
        key_map = {}
        for key in keys:
            key_id = key['id']
            key_map[key['key']] = {
                "id": key_id,
                "key": key["key"],
                "category": key["category"],
                "description": key.get("description"),
                "translations": {}
            }
        for trans in translations:
            key_id = trans["key_id"]
            if key_id in key_map:
                lang = trans["language_code"]
                key_map[key_id]["translations"][lang] = {
                    "value": trans["value"],
                    "updatedAt": trans["updated_at"],
                    "updatedBy": trans["updated_by"]
                }

        return list(key_map.values())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Post localization: It takes peoject_id as path parameter and AddRequest (pydentic model) as request body.
# Add new key, value, lang, category, description to the database.
# Here, the key will be shared across all the languages (support by the application)
@app.post("/localizations/{project_id}")
async def add_translation(project_id: str, body: AddRequest, user=Depends(get_current_user)):
    try:

        response = supabase.table("language_store").select("*").execute()
        langs = response.data
        # print(langs)

        trans_key_data = {
            "id": str(uuid.uuid4()),
            "project_id": project_id,
            "key": body.key,
            "category": body.category,
            "description": body.description
        }

        key_resp = supabase.table("translation_keys").insert(trans_key_data).execute()

        translation_rows = list()

        for lang in langs:
            translation_data = {
                "id": f"{lang['id']}_{body.key}",
                "key_id": body.key,
                "value": body.value if lang['id'] == body.language else "",
                "updated_by": user.email if lang['id'] == body.language else "",
                "language_code": lang['id'],
                "project_id": project_id,
            }
            translation_rows.append(translation_data)

        trans_resp = supabase.table("translations").insert(translation_rows).execute()

        return {"status": "success", "key_id": body.key}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Put localizations: Take project_id as path parameter, and UpdateRequest object as request body.
# It can update description in translation_key table & value, updated_by property in translation table.
@app.put("/localizations/{project_id}")
async def update_translation(project_id: str, body: UpdateRequest, user=Depends(get_current_user)):
    try:
               
        # Validation can be added to check for the key, if checked by the postman. 
        
        # Update the description in the translation_keys table
        key_update_resp = (
            supabase.table("translation_keys")
            .update({"description": body.description})
            .eq("project_id", project_id)
            .eq("key", body.key)
            .execute()
        )

        # Update the value and updated_by in the translations table
        translation_update_resp = (
            supabase.table("translations")
            .update({
                "value": body.value,
                "updated_by": user.email
            })
            .eq("key_id", body.key)
            .eq("language_code", body.language)
            .execute()
        )

        return {"status": "success", "key_id": body.key}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Delete: localization: it takes project_id and key as path parameter.
@app.delete("/localizations/{project_id}/{key}")
async def delete_translation_key(project_id: str, key: str, user=Depends(get_current_user)):
    try:
        trans_resp = supabase.table("translations").delete() \
            .eq("project_id", project_id).eq("key_id", key).execute()
        
        key_resp = supabase.table("translation_keys").delete() \
            .eq("project_id", project_id).eq("key", key).execute()


        return {"status": "success", "deleted_key": key}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Post localization/upload: It takes project_id and language as path parameter.
# And take File object as request body.
@app.post("/localizations/upload/{project_id}/{lang}")
async def upload_csv(project_id: str, lang: str, file: UploadFile = File(...), user=Depends(get_current_user)):
    # Check if the file name ends with CSV
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    content = await file.read()
    decoded = content.decode("utf-8")
    csv_reader = csv.DictReader(StringIO(decoded))

    langs = supabase.table("language_store").select("*").execute().data
    lang_ids = {lang['id'] for lang in langs}
    uploaded_keys = []

    # Case if checked from Postman or CLI
    if lang not in lang_ids:
        raise HTTPException(status_code=400, detail=f"Invalid language '{lang}'")

    for row in csv_reader:
        key = row.get("key")
        value = row.get("value")
        description = row.get("description", "")
        category = row.get("category")

        if not key or not value or not category:
            continue

        key_id = str(uuid.uuid4())
        supabase.table("translation_keys").insert({
            "id": key_id,
            "project_id": project_id,
            "key": key,
            "category": category,
            "description": description,
        }).execute()

        for l in langs:
            supabase.table("translations").insert({
                "id": f"{l['id']}_{key}",
                "key_id": key,
                "value": value if l['id'] == lang else "",
                "updated_by": user.email if l['id'] == lang else "",
                "language_code": l['id'],
                "project_id": project_id,
            }).execute()

        uploaded_keys.append(key)

    return {"status": "success", "uploaded": uploaded_keys}
