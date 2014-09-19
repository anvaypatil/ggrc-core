scope = "Workflow"
description = """
  """
permissions = {
    "read": [
        "Workflow",
        "WorkflowPerson",
        "TaskGroup",
        "TaskGroupObject",
        "TaskGroupTask",
        "Cycle",
        "CycleTaskGroup",
        "CycleTaskGroupObject",
        "CycleTaskGroupObjectTask",
        "CycleTaskEntry",
        "UserRole",
        "Context",
        "Document",
        "ObjectDocument",
        "ObjectFolder",
        "ObjectFile",
    ],
    "create": [
        "WorkflowPerson",
        "CycleTaskEntry",
        "Document",
        "ObjectDocument",
        "ObjectFolder",
        "ObjectFile",
        "TaskGroupObject",
        "TaskGroupTask",
    ],
    "update": [
        "WorkflowPerson",
        "CycleTaskGroupObjectTask",
        "CycleTaskEntry",
        "Document",
        "ObjectDocument",
        "ObjectFolder",
        "ObjectFile",
        "TaskGroupObject",
        "TaskGroupTask",
    ],
    "delete": [
        "WorkflowPerson",
        "CycleTaskEntry",
        "Document",
        "ObjectDocument",
        "ObjectFolder",
        "ObjectFile",
        "TaskGroupObject",
        "TaskGroupTask",
    ],
    "view_object_page": [
        "Workflow",
    ],
}
