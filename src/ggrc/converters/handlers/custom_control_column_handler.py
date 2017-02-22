# Copyright (C) 2017 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
"""Handler for imports and exports snapshoted control instances."""

from ggrc.converters import errors
from ggrc.converters.handlers import snapshot_instance_column_handler


class CustomControlSnapshotInstanceColumnHandler(
        snapshot_instance_column_handler.SnapshotInstanceColumnHandler):
  """Custom Control Column Handler

  return instances that mapped only over snapshot instance
  """

  def is_valid_creation(self, to_append_ids):
    "return True if data valid else False"
    if not to_append_ids:
      return True
    pool_ids = {i.child_id for i in self.audit_object_pool_query.all()}
    if to_append_ids - pool_ids:
      self.add_error(errors.ILLIGAL_APPEND_CONTROL_VALUE,
                     object_type=self.row_converter.obj.__class__.__name__)
      return False
    return True

  def parse_item(self, *args, **kwargs):
    "parse items and make validation"
    items = super(
        CustomControlSnapshotInstanceColumnHandler, self
    ).parse_item(
        *args, **kwargs
    )
    if self.dry_run:
      # TODO: is_valid_creation should work with codes instead of ids and it
      # should also be checked on dry runs.
      return items
    exists_ids = {i for i, in self.snapshoted_instances_query.values("id")}
    import_ids = {i.id for i in items or []}
    to_append_ids = import_ids - exists_ids
    self.is_valid_creation(to_append_ids)
    return items
