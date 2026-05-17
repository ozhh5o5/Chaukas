import json
import os
import shutil
import uuid
from pathlib import Path

# Local DB and Uploads paths
BACKEND_DIR = Path(__file__).parent.resolve()
DB_FILE = BACKEND_DIR / "local_db.json"
UPLOADS_DIR = BACKEND_DIR / "uploads"

# Ensure uploads directory exists
os.makedirs(UPLOADS_DIR, exist_ok=True)

def load_db():
    if not DB_FILE.exists():
        return {}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

class MockResponse:
    def __init__(self, data, count=None):
        self.data = data
        self.count = count if count is not None else len(data)

class MockTable:
    def __init__(self, db, table_name):
        self.db = db
        self.table_name = table_name
        self._query_type = None
        self._data = None
        self._eq = {}
        self._neq = {}
        self._gte = {}
        self._order = None
        self._limit = None

    def select(self, cols="*", count=None):
        self._query_type = "select"
        return self

    def insert(self, data):
        self._query_type = "insert"
        self._data = data
        return self

    def update(self, data):
        self._query_type = "update"
        self._data = data
        return self

    def upsert(self, data):
        self._query_type = "upsert"
        self._data = data
        return self

    def delete(self):
        self._query_type = "delete"
        return self

    def eq(self, col, val):
        self._eq[col] = val
        return self

    def neq(self, col, val):
        self._neq[col] = val
        return self

    def gte(self, col, val):
        self._gte[col] = val
        return self

    def order(self, col, desc=False):
        self._order = (col, desc)
        return self

    def limit(self, limit):
        self._limit = limit
        return self

    def _auto_fields(self, row):
        """Auto-generate id, created_at, etc. like a real Postgres DB."""
        import uuid as _uuid
        from datetime import datetime as _dt
        if "id" not in row and "incident_id" not in row:
            row["id"] = str(_uuid.uuid4())
        if "created_at" not in row:
            row["created_at"] = _dt.now().isoformat()
        if "updated_at" not in row:
            row["updated_at"] = _dt.now().isoformat()
        if "reported_at" not in row:
            row["reported_at"] = _dt.now().isoformat()
        return row

    def execute(self):
        db_data = load_db()
        if self.table_name not in db_data:
            db_data[self.table_name] = []
        
        table = db_data[self.table_name]
        
        if self._query_type in ("insert", "upsert"):
            if isinstance(self._data, list):
                enriched = [self._auto_fields(dict(d)) for d in self._data]
                table.extend(enriched)
                result = enriched
            else:
                enriched = self._auto_fields(dict(self._data))
                table.append(enriched)
                result = [enriched]
            save_db(db_data)
            return MockResponse(result)
            
        elif self._query_type == "update":
            result = []
            for item in table:
                match = True
                for k, v in self._eq.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    item.update(self._data)
                    result.append(item)
            save_db(db_data)
            return MockResponse(result)
            
        elif self._query_type == "delete":
            new_table = []
            for item in table:
                match = True
                for k, v in self._eq.items():
                    if item.get(k) == v:
                        match = False
                        break
                if match:
                    new_table.append(item)
            db_data[self.table_name] = new_table
            save_db(db_data)
            return MockResponse([])
            
        elif self._query_type == "select":
            result = []
            for item in table:
                match = True
                for k, v in self._eq.items():
                    if item.get(k) != v:
                        match = False
                        break
                for k, v in self._neq.items():
                    if item.get(k) == v:
                        match = False
                        break
                for k, v in self._gte.items():
                    if item.get(k) is None or str(item.get(k)) < str(v):
                        match = False
                        break
                if match:
                    result.append(item)
                    
            if self._order:
                col, desc = self._order
                result.sort(key=lambda x: str(x.get(col) or ""), reverse=desc)
                
            if self._limit:
                result = result[:self._limit]
                
            return MockResponse(result)

class MockStorageBucket:
    def __init__(self, bucket_id):
        self.bucket_id = bucket_id
        
    def upload(self, path, file_data, file_options=None):
        # file_data is typically bytes in python supabase client
        try:
            full_path = UPLOADS_DIR / path
            os.makedirs(full_path.parent, exist_ok=True)
            with open(full_path, "wb") as f:
                f.write(file_data)
            return {"Key": f"{self.bucket_id}/{path}"}
        except Exception as e:
            return {"error": str(e)}
            
    def get_public_url(self, path):
        # We will serve uploads via FastAPI static files at /uploads/
        # Adjust URL to point to local fastAPI server
        return f"http://localhost:8000/uploads/{path}"

class MockStorage:
    def from_(self, bucket_id):
        return MockStorageBucket(bucket_id)

class MockAuth:
    def sign_in(self, **kwargs):
        return MockResponse({"user": {"id": "mock-admin-id"}})

class MockSupabase:
    def __init__(self):
        self.storage = MockStorage()
        self.auth = MockAuth()
        
    def table(self, table_name):
        return MockTable(self, table_name)

# Export a pre-instantiated mock client instead of requiring real credentials
supabase = MockSupabase()
Client = MockSupabase

def create_client(url, key):
    return MockSupabase()
