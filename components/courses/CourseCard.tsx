"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface CourseCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  instructor: {
    name: string;
    image?: string | null;
  };
  category: string;
  difficulty?: string | null;
  rating?: number;
  totalReviews?: number;
  price?: number;
  enrollments?: number;
}

export function CourseCard({
  title,
  slug,
  description,
  thumbnailUrl,
  instructor,
  category,
  difficulty,
  rating = 0,
  totalReviews = 0,
  enrollments = 0,
  price = 0,
}: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <Link href={`/courses/${slug}`}>
          <div className="relative w-full h-48 bg-gray-200">
            <Image
              src={thumbnailUrl || "/placeholder-course.jpg"}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </Link>
        <CardHeader className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
              {category}
            </span>
            {difficulty && (
              <span className="text-xs text-gray-500">{difficulty}</span>
            )}
          </div>
          <Link href={`/courses/${slug}`}>
            <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({totalReviews})</span>
            </div>
            <span className="text-gray-500">{enrollments} students</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>By {instructor.name}</span>
            <span
              className={`font-semibold ${
                price === 0 ? "text-green-600" : "text-gray-900"
              }`}
            >
              {price === 0 ? "Free" : `$${price.toFixed(2)}`}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/courses/${slug}`} className="w-full">
            <Button className="w-full">View Course</Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
