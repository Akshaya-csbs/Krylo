import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import mongomock
import mongomock_motor
from beanie import init_beanie
from app.config import settings
from app.models import all_models

logger = logging.getLogger("uvicorn")

# Patch Motor append_metadata compatibility with Beanie 2.x
setattr(AsyncIOMotorClient, "append_metadata", lambda self, *args, **kwargs: None)
setattr(AsyncIOMotorDatabase, "append_metadata", lambda self, *args, **kwargs: None)

# Patch mongomock authorizedCollections parameter compatibility
orig_list_col_names = mongomock.database.Database.list_collection_names
def patched_list_col_names(self, session=None, filter=None, **kwargs):
    kwargs.pop("authorizedCollections", None)
    kwargs.pop("nameOnly", None)
    return orig_list_col_names(self, session=session, filter=filter, **kwargs)
mongomock.database.Database.list_collection_names = patched_list_col_names


async def seed_mock_data():
    try:
        from app.models.user import User, Organization
        from app.models.brand import Brand
        from beanie import PydanticObjectId
        
        # Valid 24-char ObjectID
        org_id_str = "66f4321949182390a845942d"
        org_id = PydanticObjectId(org_id_str)
        
        # Check if org exists
        org = await Organization.get(org_id)
        if not org:
            org = Organization(id=org_id, name="Mock Organization", slug="mock-org", plan="Enterprise")
            await org.insert()
            
        # Check if user exists
        user = await User.get(org_id)
        if not user:
            user = User(
                id=org_id,
                organization_id=org_id_str,
                full_name="Mock Admin",
                email="admin@klyro.mock",
                password_hash="mock",
                role="super_admin"
            )
            await user.insert()
            
        # Check if brand exists
        brand = await Brand.get(org_id)
        if not brand:
            brand = Brand(
                id=org_id,
                organization_id=org_id_str,
                name="Mock Brand",
                industry="Technology",
                website="https://mock.com",
                created_by=org_id_str
            )
            await brand.insert()
            logger.info("Mock DB seeded successfully for development.")
    except Exception as e:
        logger.error(f"Failed to seed mock DB: {e}")

async def init_db():
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1000)
        await client.admin.command('ping')
        database = client[settings.DATABASE_NAME]
        await init_beanie(database=database, document_models=all_models)
        logger.info(f"Successfully connected to MongoDB database '{settings.DATABASE_NAME}'")
    except Exception as e:
        logger.info(f"Real MongoDB connection unavailable ({e}). Fallback to in-memory AsyncMongoMockClient database.")
        mock_client = mongomock_motor.AsyncMongoMockClient()
        mock_db = mock_client[settings.DATABASE_NAME]
        await init_beanie(database=mock_db, document_models=all_models)
        logger.info(f"Successfully initialized in-memory MongoDB database '{settings.DATABASE_NAME}' with Beanie.")
        
    # Seed DB with mock data for hackathon
    await seed_mock_data()
