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


async def seed_initial_data():
    """Seed the database with real Klyros brand data for a working demo."""
    try:
        from app.models.user import User, Organization
        from app.models.brand import Brand
        from app.models.identity import BrandIdentity
        from beanie import PydanticObjectId
        from datetime import datetime, timezone

        # Fixed IDs for consistent dev environment
        org_id_str = "66f4321949182390a845942d"
        org_id = PydanticObjectId(org_id_str)

        # 1. Organization
        org = await Organization.get(org_id)
        if not org:
            org = Organization(
                id=org_id,
                name="Klyros Technologies",
                slug="klyros",
                industry="Technology",
                website="https://klyros.ai",
                plan="Enterprise"
            )
            await org.insert()
            logger.info("Seeded: Organization 'Klyros Technologies'")

        # 2. Admin User (password_hash is a placeholder — dev uses mock token bypass)
        user = await User.get(org_id)
        if not user:
            user = User(
                id=org_id,
                organization_id=org_id_str,
                full_name="Akshaya Admin",
                email="admin@klyros.ai",
                password_hash="$2b$12$placeholder_dev_hash_only",
                role="super_admin"
            )
            await user.insert()
            logger.info("Seeded: Admin user 'admin@klyros.ai'")

        # 3. Brand
        brand = await Brand.get(org_id)
        if not brand:
            brand = Brand(
                id=org_id,
                organization_id=org_id_str,
                name="Klyros",
                industry="Technology",
                website="https://klyros.ai",
                description="Klyros is an AI-powered brand intelligence platform that helps marketers validate, analyze, and optimize brand assets in real time.",
                languages=["English"],
                status="active",
                created_by=org_id_str
            )
            await brand.insert()
            logger.info("Seeded: Brand 'Klyros'")

        # 4. Brand Identity (empty — will be filled by AI on first asset upload)
        identity = await BrandIdentity.find_one(BrandIdentity.brand_id == org_id_str)
        if not identity:
            identity = BrandIdentity(
                brand_id=org_id_str,
                brand_summary="Klyros is an AI-powered brand intelligence platform designed to help marketing teams validate and optimize their brand assets using real-time AI analysis.",
                keywords=["AI", "Brand Intelligence", "Marketing Tech"],
                services=["Brand Analysis", "AI Validation", "Asset Management"],
                social_links={"Website": "https://klyros.ai", "LinkedIn": "https://linkedin.com/company/klyros"},
                metrics={"avg_engagement": "0%", "monthly_reach": "0", "post_validation": "0/100"},
                status="ready",
                version=1
            )
            await identity.insert()
            logger.info("Seeded: Brand Identity for Klyros")

        logger.info("✅ Database seeded successfully.")

    except Exception as e:
        logger.error(f"Failed to seed DB: {e}")


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

    await seed_initial_data()
