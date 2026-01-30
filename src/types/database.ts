export type PropertyType = 'apartment' | 'house' | 'ph' | 'land';
export type OperationType = 'sale' | 'rent';
export type PropertyCondition = 'new' | 'excellent' | 'good' | 'fair' | 'to_renovate';
export type PropertyStatus = 'draft' | 'pending' | 'active' | 'sold' | 'paused';
export type UserRole = 'visitor' | 'seller' | 'buyer' | 'admin';
export type ReportType = 'seller' | 'buyer';
export type PriceIndicator = 'overpriced' | 'market' | 'opportunity';
export type ArticleStatus = 'draft' | 'published';
export type LeadType = 'property_inquiry' | 'value_report' | 'advisor_contact';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type VisitAppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type TimeSlot = 'morning' | 'midday' | 'afternoon';

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
  created_at: string;
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
  estimated_min: number;
  estimated_max: number;
  suggested_price: number;
  price_indicator: PriceIndicator;
  estimated_sale_days: number | null;
  comparables: Comparable[];
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
  created_at: string;
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
        Update: never;
      };
      visit_appointments: {
        Row: VisitAppointment;
        Insert: Omit<VisitAppointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VisitAppointment, 'id' | 'created_at'>>;
      };
    };
  };
}
