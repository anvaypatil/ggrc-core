# Copyright (C) 2017 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

"""
Fix Assessment contexts

Create Date: 2017-02-19 22:18:07.518997
"""
# disable Invalid constant name pylint warning for mandatory Alembic variables.
# pylint: disable=invalid-name

from alembic import op

# revision identifiers, used by Alembic.
revision = '4e7fda17abc7'
down_revision = '2f1cee67a8f3'


def upgrade():
  """Upgrade database schema and/or data, creating a new revision."""
  # Fixes assessments without audit context
  # SELECT COUNT(*) FROM assessments
  #  WHERE context_id is NULL;
  sql = """
  UPDATE assessments as a
    JOIN relationships AS r ON r.source_id = a.id
     AND r.source_type = 'Assessment' AND r.destination_type = 'Audit'
    JOIN audits AS au ON r.destination_id = au.id
     SET a.context_id = au.context_id
   WHERE a.context_id is NULL;
  """
  op.execute(sql)
  sql = """
  UPDATE assessments as a
    JOIN relationships AS r ON r.destination_id = a.id
     AND r.destination_type = 'Assessment' AND r.source_type = 'Audit'
    JOIN audits AS au ON r.source_id = au.id
     SET a.context_id = au.context_id
   WHERE a.context_id is NULL;
  """
  op.execute(sql)
  # Fixes object_documents mapped to assessments without audit context
  # SELECT COUNT(*) FROM object_documents
  #  WHERE documentable_type = 'Assessment' AND context_id IS NULL;
  sql = """
  UPDATE object_documents AS od
    JOIN assessments AS a ON od.documentable_id = a.id
     SET od.context_id = a.context_id
   WHERE documentable_type = 'Assessment' AND od.context_id IS NULL;
  """
  op.execute(sql)
  # Fixes documents attached to assessments without audit context
  # SELECT count(*)
  #   FROM documents AS d
  #   JOIN object_documents AS od ON d.id = od.document_id
  #  WHERE od.documentable_type = 'Assessment' AND d.context_id IS NULL;
  sql = """
  UPDATE documents AS d
    JOIN object_documents AS od ON od.document_id = d.id
     AND od.documentable_type = 'Assessment'
     SET d.context_id = od.context_id
   WHERE d.context_id IS NULL
  """
  op.execute(sql)


def downgrade():
  """Nothing to do here."""
  pass
