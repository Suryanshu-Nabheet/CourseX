export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface NavLink {
  name: string;
  href: string;
  icon: any; // Using any for Lucide icons to avoid complex type dependencies for now
}

export interface CourseBasicInfo {
  id: string;
  title: string;
  price: number | null;
  published: boolean;
  imageUrl?: string | null; // Added for consistency
}
