"""create_tables

Revision ID: create_tables
Revises: 
Create Date: 2025-02-10
"""

from alembic import op
import sqlalchemy as sa

revision = '20250210_1_create_tables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'social_data',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('platform', sa.String(50), nullable=True),
        sa.Column('reference_id', sa.String(100), nullable=True),
        sa.Column('text_content', sa.Text, nullable=True),
        sa.Column('sentiment_score', sa.Float, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_table(
        'price_data',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('coin_id', sa.String(100), nullable=False),
        sa.Column('symbol', sa.String(50), nullable=True),
        sa.Column('price', sa.Numeric, nullable=True),
        sa.Column('market_cap', sa.Numeric, nullable=True),
        sa.Column('volume', sa.Numeric, nullable=True),
        sa.Column('timestamp', sa.DateTime, nullable=True)
    )

def downgrade():
    op.drop_table('price_data')
    op.drop_table('social_data')
