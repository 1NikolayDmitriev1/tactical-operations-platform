import os
import bcrypt
from dotenv import load_dotenv
from sqlalchemy.orm import Session

load_dotenv()

from sqlalchemy import text
from database import engine, SessionLocal, Base
import models

def seed_database():
    print("Setting up schema...")
    Base.metadata.create_all(bind=engine)

    # make sure new columns exist if db was created before we added them
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'operator';"))
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id);"))
        conn.commit()
    
    db: Session = SessionLocal()
    try:
        commander = db.query(models.User).filter_by(user_name="GHOST-7").first()
        if not commander:
            print("Creating user GHOST-7...")
            salt = bcrypt.gensalt()
            hashed_pw = bcrypt.hashpw("tactical_pass".encode("utf-8"), salt).decode("utf-8")
            commander = models.User(
                user_name="GHOST-7",
                password=hashed_pw,
                role="commander"
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
                    title="Опорний пункт «Скеля»",
                    description="Укріплений район оборони. Посилено розрахунком СПГ-9 та тепловізійним постом.",
                    priority="high",
                    status="in_progress",
                    latitude=48.4682,
                    longitude=35.0425,
                    user_id=commander.id,
                    assigned_to=commander.id,
                ),
                models.Task(
                    title="Склад БК противника (виявлено БПЛА)",
                    description="Зафіксовано активність вантажівок «Урал» та маскувальну сітку. Пріоритетна ціль для FPV-крила.",
                    priority="critical",
                    status="pending",
                    latitude=48.4750,
                    longitude=35.0610,
                    user_id=commander.id,
                ),
                models.Task(
                    title="Сектор повітряної розвідки #4",
                    description="Черговий сектор патрулювання розвідувального БПЛА Leleka-100 на висоті 1200м.",
                    priority="medium",
                    status="in_progress",
                    latitude=48.4520,
                    longitude=35.0290,
                    user_id=commander.id,
                    assigned_to=commander.id,
                ),
                models.Task(
                    title="Позиція комплексу РЕБ «Поле-21»",
                    description="Джерело активних завад супутникової навігації в радіусі 4 км. Вимагає дорозвідки.",
                    priority="critical",
                    status="pending",
                    latitude=48.4510,
                    longitude=35.0780,
                    user_id=commander.id,
                ),
                models.Task(
                    title="Точка евакуації «Броня-1»",
                    description="Основний маршрут відходу та медичної евакуації бронегруп під прикриттям посадки.",
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
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
