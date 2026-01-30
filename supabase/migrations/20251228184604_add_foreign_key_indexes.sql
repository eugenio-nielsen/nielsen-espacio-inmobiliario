/*
  # Add Indexes for Foreign Keys

  ## Changes

  1. **Foreign Key Indexes**
     - Adds indexes on foreign key columns to improve query performance
     - These indexes help with JOIN operations and cascading deletes

  ## Tables Affected
  - articles: author_id, category_id
  - favorites: property_id
  - leads: report_id, user_id
  - property_views: property_id, user_id
  - value_reports: property_id

  ## Notes
  - These indexes improve performance for queries that join on these columns
  - They also speed up DELETE operations on parent tables
*/

-- Articles table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);

-- Favorites table foreign key index
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

-- Leads table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_leads_report_id ON leads(report_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- Property views table foreign key indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);

-- Value reports table foreign key index
CREATE INDEX IF NOT EXISTS idx_value_reports_property_id ON value_reports(property_id);
