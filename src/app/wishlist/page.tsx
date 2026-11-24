import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WishlistGrid } from "@/components/courses/WishlistGrid";
import { currentUser } from "@/server/auth";
import { getDb } from "@/server/db";

export const metadata = {
  title: "My Wishlist — Elevate",
  description: "Courses saved to your Elevate wishlist.",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  await connection();
  const user = await currentUser();
  if (!user) redirect("/login");
  const courses = getDb().prepare(`SELECT c.id,c.slug,c.title,c.category,c.thumbnail,c.price_minor,c.currency,
    c.status,c.review_status,u.name instructor_name
    FROM wishlists w JOIN courses c ON c.id=w.course_id JOIN users u ON u.id=c.instructor_id
    WHERE w.user_id=? ORDER BY w.created_at DESC`).all(user.id).map((row) => ({
    id: String(row.id), slug: String(row.slug), title: String(row.title), category: String(row.category),
    thumbnail: row.thumbnail ? String(row.thumbnail) : null, priceMinor: Number(row.price_minor),
    currency: String(row.currency), instructorName: String(row.instructor_name),
    available: row.status === "published" && row.review_status === "approved",
  }));

  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
    <Navbar />
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#FF6B35]">Saved for later</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#172033]">My Wishlist</h1>
        <p className="mt-2 text-sm text-[#64748B]">The courses you marked to explore later.</p>
      </div>
      <WishlistGrid initialCourses={courses} />
    </main>
    <Footer />
  </div>;
}
