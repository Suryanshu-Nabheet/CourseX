"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, GraduationCap, Award, Globe } from "lucide-react";
import Image from "next/image";

export default function FeaturesSection() {
  const features = [
    {
      title: "Interactive Learning Experience",
      description:
        "Engage with video lessons, quizzes, and hands-on projects. Track your progress and master new skills at your own pace.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Expert Instructors Worldwide",
      description:
        "Learn from industry experts and renowned educators from around the globe.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
    {
      title: "Watch Courses Anytime",
      description:
        "Access your courses 24/7 from any device. Learn at your convenience, whether you're at home or on the go.",
      skeleton: <SkeletonThree />,
      className: "col-span-1 lg:col-span-3 lg:border-r dark:border-neutral-800",
    },
    {
      title: "Deploy Skills Globally",
      description:
        "From beginner to advanced, our courses prepare you for real-world applications. Learn skills that matter worldwide.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto bg-white">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-gray-900">
          Everything you need to learn and grow
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-gray-600 text-center font-normal">
          From beginner courses to advanced certifications, CourseX provides
          everything you need to master new skills and advance your career.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md border-gray-200">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="flex-1 w-full mt-4 min-h-[500px]">
                {feature.skeleton}
              </div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        `p-4 sm:p-8 relative overflow-hidden flex flex-col`,
        className
      )}
    >
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-gray-900 text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-gray-600 font-normal",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative w-full h-full mt-4 flex-1 min-h-[500px]">
      <div className="w-full h-full bg-gray-50 shadow-xl group rounded-lg overflow-hidden">
        <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden bg-white">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Course Dashboard"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-100 max-w-md">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg">
                  <Play className="h-5 w-5 text-primary fill-primary" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Interactive Dashboard
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <Link href="/courses" className="relative flex gap-10 h-full group/image">
      <div className="w-full mx-auto bg-transparent group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2 relative">
          <Play className="h-20 w-20 absolute z-10 inset-0 text-primary m-auto opacity-80" />
          <div className="h-full w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-sm blur-none group-hover/image:blur-md transition-all duration-200 flex items-center justify-center">
            <Award className="h-32 w-32 text-primary/30" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export const SkeletonTwo = () => {
  const images = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000&auto=format&fit=crop",
  ];

  const rotationsFirstRow = [-9.4, 1.6, -7.2, -3.9, -2.9];
  const rotationsSecondRow = [2.5, -3.3, 1.2, -3.6, -1.7];

  const imageVariants = {
    initial: (rotation: number) => ({
      rotate: rotation,
      scale: 1,
      zIndex: 1,
    }),
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
      transition: { duration: 0.2 },
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };

  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      <div className="flex flex-row -ml-20">
        {images.map((image, idx) => (
          <motion.div
            key={"images-first" + idx}
            custom={rotationsFirstRow[idx]}
            variants={imageVariants}
            initial="initial"
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white border border-gray-100 shrink-0 overflow-hidden shadow-sm"
          >
            <Image
              src={image}
              alt="instructor"
              width={500}
              height={500}
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {images.map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            custom={rotationsSecondRow[idx]}
            variants={imageVariants}
            initial="initial"
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white border border-gray-100 shrink-0 overflow-hidden shadow-sm"
          >
            <Image
              src={image}
              alt="instructor"
              width={500}
              height={500}
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>

      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-white to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-white to-transparent h-full pointer-events-none" />
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60 flex flex-col items-center relative bg-transparent mt-10">
      <GlobeComponent className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
    </div>
  );
};

const GlobeComponent = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.2, 0.5, 0.9],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.3, 0.6, 1],
      markers: [
        // longitude latitude
        { location: [37.7749, -122.4194], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [51.5074, -0.1278], size: 0.08 },
        { location: [35.6762, 139.6503], size: 0.08 },
        { location: [-33.8688, 151.2093], size: 0.06 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};
