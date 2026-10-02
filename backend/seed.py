import os
import bcrypt
from dotenv import load_dotenv
from sqlalchemy.orm import Session

load_dotenv()

import models
from database import Base, SessionLocal, engine
from sqlalchemy import text


def seed_database():
    print("Setting up schema...")
    Base.metadata.create_all(bind=engine)

    # migrations for existing DBs
    with engine.connect() as conn:
        conn.execute(
            text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'operator';"
            )
        )
        conn.execute(
            text(
                "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id);"
            )
        )
        conn.commit()

    db: Session = SessionLocal()
    try:
        commander = db.query(models.User).filter_by(user_name="GHOST-7").first()
        if not commander:
            print("Creating user GHOST-7...")
            salt = bcrypt.gensalt()
            hashed_pw = bcrypt.hashpw(b"tactical_pass", salt).decode("utf-8")
            commander = models.User(
                user_name="GHOST-7", password=hashed_pw, role="commander"
            )
            db.add(commander)
            db.commit()
            db.refresh(commander)
            print(f"  created, id={commander.id}")
        else:
            print(f"GHOST-7 already in db (id={commander.id}), skipping")

        existing_tasks = db.query(models.Task).count()
        if existing_tasks < 5:
            print(f"Adding demo tasks (found {existing_tasks} in db)...")
            seed_tasks = [
                models.Task(
                    title="Strongpoint 'Skelya'",
                    description="Fortified defensive position. Reinforced with SPG-9 anti-tank crew and thermal observation post.",
                    priority="high",
                    status="in_progress",
                    latitude=48.4682,
                    longitude=35.0425,
                    user_id=commander.id,
                    assigned_to=commander.id,
                ),
                models.Task(
                    title="Enemy Ammo Depot (UAV Detected)",
                    description="Spotted Ural truck logistics activity and camouflage netting. Priority strike target for FPV drone wing.",
                    priority="critical",
                    status="pending",
                    latitude=48.4750,
                    longitude=35.0610,
                    user_id=commander.id,
                ),
                models.Task(
                    title="Aerial Recon Sector #4",
                    description="Routine patrol sector for Leleka-100 reconnaissance UAV at 1200m altitude.",
                    priority="medium",
                    status="in_progress",
                    latitude=48.4520,
                    longitude=35.0290,
                    user_id=commander.id,
                    assigned_to=commander.id,
                ),
                models.Task(
                    title="EW Jamming Post 'Pole-21'",
                    description="Active GNSS satellite navigation jamming source in 4km radius. Requires tactical pin-down and fires.",
                    priority="critical",
                    status="pending",
                    latitude=48.4510,
                    longitude=35.0780,
                    user_id=commander.id,
                ),
                models.Task(
                    title="Medevac Point 'Armor-1'",
                    description="Primary withdrawal and medical evacuation corridor for armored group under tree line cover.",
                    priority="low",
                    status="completed",
                    latitude=48.4380,
                    longitude=35.0180,
                    user_id=commander.id,
                    assigned_to=commander.id,
                ),
            ]
            db.add_all(seed_tasks)
            db.commit()
            print(f"  added {len(seed_tasks)} tasks")
        else:
            print(f"Already have {existing_tasks} tasks, skipping seed")

        print("\n--- seed done ---")
        print("login: GHOST-7 / tactical_pass\n")

    except Exception as e:
        db.rollback()
        print(f"seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
