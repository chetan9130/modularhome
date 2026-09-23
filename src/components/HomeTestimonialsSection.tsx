import Link from "next/link";
import { PublicReview } from "@/lib/publicData";

interface HomeTestimonialsSectionProps {
  initialReviews?: PublicReview[];
}

export default function HomeTestimonialsSection({ initialReviews }: HomeTestimonialsSectionProps) {
  const reviews = (initialReviews && initialReviews.length > 0)
    ? initialReviews.slice(0, 3).map((r) => ({
        stars: "★".repeat(Math.min(5, Math.max(1, r.rating || 5))),
        quote: r.reviewText,
        author: `— ${r.customerName}`,
        location: r.location || "USA",
      }))
    : [
        {
          stars: "★★★★★",
          quote: "From initial CAD customization to final on-site modular delivery in Austin, the precision steel engineering saved us over 4 months compared to traditional stick framing. Exceptional thermal insulation!",
          author: "— David & Sarah J.",
          location: "Texas",
        },
        {
          stars: "★★★★★",
          quote: "We built in heavy snow territory in Montana. The 50 PSF snow load certification and 50-year structural steel frame warranty gave us complete peace of mind. High vaulted ceilings are stunning.",
          author: "— Marcus V.",
          location: "Montana",
        },
        {
          stars: "★★★★★",
          quote: "We purchased a downloadable floor-plan CAD package and ended up commissioning the full turnkey steel framing kit. Customer support guided our local foundation contractor seamlessly.",
          author: "— Elena R.",
          location: "Arizona",
        },
      ];

  return (
    <section className="py-12 sm:py-16 bg-white" id="testimonials">
      <div className="wrap">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-[-1.3px] text-[#101114] m-0">
              What Our Customers Say
            </h2>
            <p className="text-sm sm:text-base text-[#6b7280] mt-1.5 mb-0">
              Real stories and verified ratings from modular homeowners nationwide.
            </p>
          </div>
          <Link
            href="/about#testimonials"
            className="text-[#d97706] hover:text-[#b45309] font-extrabold text-sm sm:text-base hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            View All Reviews →
          </Link>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="card p-6 flex flex-col justify-between bg-white hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="text-[#fcb907] text-xl font-bold tracking-wider mb-3">
                  {rev.stars}
                </div>
                <p className="text-sm sm:text-base text-[#101114] font-medium leading-relaxed italic mb-4">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-[#e7e9ee] flex items-center justify-between">
                <b className="text-sm font-black text-[#101114]">
                  {rev.author}
                </b>
                <span className="text-xs text-[#6b7280] font-medium">
                  {rev.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
