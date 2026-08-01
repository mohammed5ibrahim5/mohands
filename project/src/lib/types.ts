export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  parent_id: string | null;
  created_at: string;
  subcategories?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  featured: boolean;
  active: boolean;
  rating: number;
  sku: string | null;
  brand: string | null;
  weight: number | null;
  created_at: string;
  category?: Category | null;
  reviews?: Review[];
}

export interface Review {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  city: string;
  notes: string | null;
  status: OrderStatus;
  total: number;
  shipping_cost: number;
  payment_method: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-violet-100 text-violet-700 border-violet-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  storeDescription: string;
  phone: string;
  email: string;
  address: string;
  announcementText: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroImageUrl: string;
  promoTitle: string;
  promoSubtitle: string;
  promoCta: string;
  promoDiscountPercent: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
  socialWhatsapp: string;
  heroStat1Value: string;
  heroStat1Label: string;
  heroStat2Value: string;
  heroStat2Label: string;
  heroStat3Value: string;
  heroStat3Label: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  feature4Title: string;
  feature4Description: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  aboutTitle: string;
  aboutDescription: string;
  shippingTitle: string;
  shippingDescription: string;
  policyTitle: string;
  policyDescription: string;
  footerDescription: string;
  footerNote: string;
  accentColor: string;
  accentTextColor: string;
  showAnnouncementBar: boolean;
  showNewsletter: boolean;
  showTestimonials: boolean;
  showAboutSection: boolean;
  showNewArrivalsSection: boolean;
  pageBackgroundColor: string;
  cardBackgroundColor: string;
  cardRadius: 'rounded-2xl' | 'rounded-3xl' | 'rounded-none';
  buttonStyle: 'filled' | 'outline' | 'rounded';
  heroLayout: 'classic' | 'split' | 'minimal';
  showCategorySection: boolean;
  showFeaturedSection: boolean;
  showPromoSection: boolean;
  sectionSpacing: 'compact' | 'normal' | 'spacious';
}

export function getSessionId(): string {
  let id = localStorage.getItem('session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('session_id', id);
  }
  return id;
}
