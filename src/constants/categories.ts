import {
  ShoppingCart,
  Home,
  TrendingUp,
  Brain,
  Briefcase,
  Laptop,
  Mic,
  Presentation,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

/** Shared category list for Classes and Communities. None of these → user selects "Other". */
export const CLASS_AND_COMMUNITY_CATEGORIES: {
  value: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: 'ecommerce', label: 'E-commerce & Digital', icon: ShoppingCart },
  { value: 'realestate', label: 'Real Estate & Investing', icon: Home },
  { value: 'marketing', label: 'Marketing & Growth', icon: TrendingUp },
  { value: 'mentality', label: 'Mentality & Lifestyle', icon: Brain },
  { value: 'business', label: 'Business', icon: Briefcase },
  { value: 'tech', label: 'Tech', icon: Laptop },
  { value: 'diction', label: 'Diction & Speech', icon: Mic },
  { value: 'acting', label: 'Acting & Audition', icon: Presentation },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];
