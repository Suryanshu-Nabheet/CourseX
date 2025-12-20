import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-green-900">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80"
            alt="Team collaboration"
            fill
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-6">Join CourseX Today</h1>
          <p className="text-lg text-gray-300">
            Start learning from the best instructors in the world.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <SignUp />
      </div>
    </div>
  );
}
