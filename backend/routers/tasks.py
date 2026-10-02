from typing import Annotated

import models
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query, status
from schemas import PartialTaskModel, TaskModel
from sqlalchemy.orm import Session

from routers.auth import verify_token

router = APIRouter(prefix="/api/tasks", tags=["tasks"])
DbSession = Annotated[Session, Depends(get_db)]


@router.get("")
def get_tasks(
    db: DbSession,
    user: Annotated[dict, Depends(verify_token)],
    assigned_to_me: bool = Query(
        False, description="Filter tasks assigned to the current operator"
    ),
):
    # TODO: role permissions
    query = db.query(models.Task).filter(
        (models.Task.user_id == user["id"]) | (models.Task.assigned_to == user["id"])
    )
    if assigned_to_me:
        query = query.filter(models.Task.assigned_to == user["id"])
    return query.all()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskModel,
    user: Annotated[dict, Depends(verify_token)],
    db: DbSession,
):
    new_task = models.Task(
        title=task.title,
        priority=task.priority,
        latitude=task.latitude,
        longitude=task.longitude,
        description=task.description,
        user_id=user["id"],
        assigned_to=task.assigned_to,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"status": "success", "data": new_task}


@router.patch("/{task_id}")
def update_task(
    task_id: int,
    task_data: PartialTaskModel,
    user: Annotated[dict, Depends(verify_token)],
    db: DbSession,
):
    task = db.get(models.Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    user: Annotated[dict, Depends(verify_token)],
    db: DbSession,
):
    task = db.get(models.Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted", "task_id": task_id}
