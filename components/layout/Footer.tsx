import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-[#1E293B]">CourseX</span>
            </Link>
            <p className="text-sm text-gray-600">
              Learn anything, anywhere, anytime. Join thousands of students
              learning from expert instructors.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Students</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/courses" className="hover:text-primary">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/dashboard/student" className="hover:text-primary">
                  My Courses
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Instructors</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link
                  href="/dashboard/instructor"
                  className="hover:text-primary"
                >
                  Instructor Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/instructor/create"
                  className="hover:text-primary"
                >
                  Create Course
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} Suryanshu Nabheet. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
