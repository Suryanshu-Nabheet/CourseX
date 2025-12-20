import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/api/enrollments(.*)", // Protect enrollment API
  "/api/payments(.*)", // Protect payment API
  "/api/wishlist(.*)", // Protect wishlist API
  // Add other protected routes as needed
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
