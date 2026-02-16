export type PropertyType = 'apartment' | 'house' | 'ph' | 'land';
export type OperationType = 'sale' | 'rent';
export type PropertyCondition = 'new' | 'excellent' | 'good' | 'fair' | 'to_renovate';
export type PropertyStatus = 'draft' | 'pending' | 'active' | 'sold' | 'paused';
export type UserRole = 'visitor' | 'seller' | 'buyer' | 'admin' | 'super_admin';
export type ReportType = 'seller' | 'buyer';
export type PriceIndicator = 'overpriced' | 'market' | 'opportunity';
export type ArticleStatus = 'draft' | 'published';
export type LeadType = 'property_inquiry' | 'value_report' | 'advisor_contact';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type VisitAppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type TimeSlot = 'morning' | 'midday' | 'afternoon';
export type NotificationType = 'user_registration' | 'new_property' | 'property_status_change' | 'new_lead' | 'role_change' | 'suspicious_activity';
export type AuditActionType = 'property_create' | 'property_update' | 'property_delete' | 'user_update' | 'lead_update' | 'data_export' | 'role_change';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  operation_type: OperationType;
  price: number;
  currency: string;
  address: string;
  city: string;
  neighborhood: string | null;
  province: string;
  latitude: number | null;
  longitude: number | null;
  covered_area: number | null;
  semi_covered_area: number | null;
  total_area: number | null;
  rooms: number;
  bathrooms: number;
  bedrooms: number;
  garages: boolean;
  property_condition: PropertyCondition;
  amenities: string[];
  status: PropertyStatus;
  views_count: number;
  contacts_count: number;
  featured: boolean;
  floor: number | null;
  layout: string | null;
  orientation: string | null;
  expenses: number | null;
  has_superintendent: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_primary: boolean;
  order_index: number;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyVideo {
  id: string;
  property_id: string;
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  order_index: number;
  created_at: string;
}

export interface PropertyPlan {
  id: string;
  property_id: string;
  url: string;
  title: string | null;
  order_index: number;
  created_at: string;
}

export interface ValueReport {
  id: string;
  user_id: string | null;
  property_id: string | null;
  report_type: ReportType;
  address: string;
  city: string;
  neighborhood: string | null;
  province: string;
  property_type: PropertyType;
  covered_area: number;
  semi_covered_area: number | null;
  total_area: number | null;
  property_condition: PropertyCondition;
  rooms: number;
  bathrooms: number;
  bedrooms: number;
  floor_number: number | null;
  total_floors: number | null;
  has_elevator: boolean;
  orientation: string | null;
  amenities: string[];
  building_age: number | null;
  year_built: number | null;
  renovation_year: number | null;
  building_type: string | null;
  monthly_expenses: number | null;
  parking_spaces: number;
  property_layout: string | null;
  natural_lighting: string | null;
  noise_level: string | null;
  view_quality: string | null;
  estimated_min: number;
  estimated_max: number;
  suggested_price: number;
  price_indicator: PriceIndicator;
  estimated_sale_days: number | null;
  comparables: Comparable[];
  valuation_breakdown: ValuationBreakdown;
  confidence_score: number | null;
  created_at: string;
}

export interface Comparable {
  id: string;
  address: string;
  price: number;
  covered_area: number;
  price_per_sqm: number;
  days_on_market: number;
}

export interface ValuationBreakdown {
  base_price_per_sqm: number;
  effective_area: number;
  location_factor: number;
  property_type_factor: number;
  condition_factor: number;
  floor_adjustment: number;
  orientation_bonus: number;
  parking_value: number;
  amenities_score: number;
  age_depreciation: number;
  layout_efficiency: number;
  quality_adjustments: number;
  final_price_per_sqm: number;
  factors_applied: Array<{
    name: string;
    value: number;
    impact: string;
  }>;
}

export interface NeighborhoodCharacteristics {
  id: string;
  city: string;
  neighborhood: string;
  province: string;
  avg_price_per_sqm: number | null;
  median_price_per_sqm: number | null;
  avg_days_on_market: number | null;
  market_velocity: string | null;
  transport_score: number | null;
  schools_score: number | null;
  commerce_score: number | null;
  safety_score: number | null;
  description: string | null;
  last_updated: string;
  created_at: string;
}

export interface MarketTrend {
  id: string;
  city: string;
  neighborhood: string | null;
  province: string;
  property_type: PropertyType;
  period_start: string;
  period_end: string;
  avg_price_per_sqm: number;
  median_price_per_sqm: number;
  total_listings: number;
  total_sales: number;
  avg_days_on_market: number | null;
  price_change_percentage: number | null;
  created_at: string;
}

export interface ValuationFactor {
  id: string;
  factor_name: string;
  factor_category: string;
  weight: number;
  min_value: number | null;
  max_value: number | null;
  description: string | null;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface Article {
  id: string;
  author_id: string | null;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  seo_title: string | null;
  seo_description: string | null;
  category?: ArticleCategory;
  author?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface Lead {
  id: string;
  property_id: string | null;
  report_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  lead_type: LeadType;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface PropertyView {
  id: string;
  property_id: string;
  user_id: string | null;
  ip_address: string | null;
  session_id: string;
  user_agent: string | null;
  last_viewed_at: string;
  view_count: number;
  created_at: string;
}

export interface PropertyViewStats {
  property_id: string;
  view_date: string;
  unique_views: number;
  total_views: number;
  anonymous_views: number;
  authenticated_views: number;
  created_at: string;
  updated_at: string;
}

export interface VisitAppointment {
  id: string;
  property_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  visit_date: string;
  time_slots: string[];
  status: VisitAppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_user_id: string | null;
  related_property_id: string | null;
  related_lead_id: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action_type: AuditActionType;
  entity_type: string;
  entity_id: string | null;
  affected_user_id: string | null;
  changes: Record<string, any> | null;
  description: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'contacts_count'>;
        Update: Partial<Omit<Property, 'id' | 'created_at'>>;
      };
      property_images: {
        Row: PropertyImage;
        Insert: Omit<PropertyImage, 'id' | 'created_at'>;
        Update: Partial<Omit<PropertyImage, 'id'>>;
      };
      property_videos: {
        Row: PropertyVideo;
        Insert: Omit<PropertyVideo, 'id' | 'created_at'>;
        Update: Partial<Omit<PropertyVideo, 'id'>>;
      };
      property_plans: {
        Row: PropertyPlan;
        Insert: Omit<PropertyPlan, 'id' | 'created_at'>;
        Update: Partial<Omit<PropertyPlan, 'id'>>;
      };
      value_reports: {
        Row: ValueReport;
        Insert: Omit<ValueReport, 'id' | 'created_at'>;
        Update: Partial<Omit<ValueReport, 'id'>>;
      };
      article_categories: {
        Row: ArticleCategory;
        Insert: Omit<ArticleCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<ArticleCategory, 'id'>>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views_count'>;
        Update: Partial<Omit<Article, 'id' | 'created_at'>>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'>;
        Update: never;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>;
      };
      property_views: {
        Row: PropertyView;
        Insert: Omit<PropertyView, 'id' | 'created_at'>;
        Update: Partial<Omit<PropertyView, 'id' | 'created_at' | 'property_id'>>;
      };
      property_view_stats: {
        Row: PropertyViewStats;
        Insert: Omit<PropertyViewStats, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PropertyViewStats, 'property_id' | 'view_date' | 'created_at'>>;
      };
      visit_appointments: {
        Row: VisitAppointment;
        Insert: Omit<VisitAppointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VisitAppointment, 'id' | 'created_at'>>;
      };
      neighborhood_characteristics: {
        Row: NeighborhoodCharacteristics;
        Insert: Omit<NeighborhoodCharacteristics, 'id' | 'created_at' | 'last_updated'>;
        Update: Partial<Omit<NeighborhoodCharacteristics, 'id'>>;
      };
      market_trends: {
        Row: MarketTrend;
        Insert: Omit<MarketTrend, 'id' | 'created_at'>;
        Update: Partial<Omit<MarketTrend, 'id'>>;
      };
      valuation_factors: {
        Row: ValuationFactor;
        Insert: Omit<ValuationFactor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ValuationFactor, 'id' | 'created_at'>>;
      };
      admin_notifications: {
        Row: AdminNotification;
        Insert: Omit<AdminNotification, 'id' | 'created_at' | 'email_sent' | 'email_sent_at' | 'read' | 'read_at'>;
        Update: Partial<Omit<AdminNotification, 'id' | 'created_at'>>;
      };
      audit_log: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}
