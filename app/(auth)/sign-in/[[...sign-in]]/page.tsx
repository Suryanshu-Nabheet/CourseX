import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
            alt="Students learning"
            fill
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-6">Welcome back to CourseX</h1>
          <p className="text-lg text-gray-300">
            Continue your learning journey with our expert-led courses.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <SignIn />
      </div>
    </div>
  );
}
