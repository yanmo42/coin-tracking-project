<%  
import datetime
revision = context.get('revision', "some_revision")
down_revision = context.get('down_revision', None)
branch_labels = None
depends_on = None
%>
"""${message}

Revision ID: ${revision}
Revises: ${down_revision if down_revision else None}
Create Date: ${datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    pass

def downgrade():
    pass
