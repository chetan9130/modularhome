import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logAdminActivity } from "@/lib/activityLog";

// In-memory fallback
let memoryReviews: any[] = [
  {
    id: "rev-1",
    customer_name: "David & Sarah Jenkins",
    location: "Austin, Texas",
    rating: 5,
    review_text: "From initial CAD customization to final on-site modular delivery in Austin, the precision steel engineering saved us over 4 months compared to traditional stick framing. Exceptional thermal insulation!",
    project_title: "The Aspen Barndominium (2,400 SQ FT)",
    status: "PUBLISHED",
    is_featured: true,
    display_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "rev-2",
    customer_name: "Marcus Vance",
    location: "Bozeman, Montana",
    rating: 5,
    review_text: "We built in heavy snow territory in Montana. The 50 PSF snow load certification and 50-year structural steel frame warranty gave us complete peace of mind. High vaulted ceilings are stunning.",
    project_title: "The Ridgeview Modern Cabin",
    status: "PUBLISHED",
    is_featured: true,
    display_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "rev-3",
    customer_name: "Elena Rodriguez",
    location: "Phoenix, Arizona",
    rating: 5,
    review_text: "We purchased a downloadable floor-plan CAD package and ended up commissioning the full turnkey steel framing kit. Customer support guided our local foundation contractor seamlessly.",
    project_title: "The Clearwater Multi-Gen ADU",
    status: "PUBLISHED",
    is_featured: true,
    display_order: 3,
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }

    return NextResponse.json({ success: true, data: memoryReviews });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch reviews.", code: "REVIEWS_FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { customerName, location, rating, reviewText, projectTitle, imageUrl, status, isFeatured, displayOrder } = body;

    if (!customerName || !reviewText) {
      return NextResponse.json(
        { success: false, error: { message: "Customer name and review text are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const newReview = {
      customer_name: customerName,
      location: location || "",
      rating: Number(rating) || 5,
      review_text: reviewText,
      project_title: projectTitle || "",
      image_url: imageUrl || null,
      status: status || "PUBLISHED",
      is_featured: Boolean(isFeatured),
      display_order: Number(displayOrder) || 0,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .insert(newReview)
        .select()
        .single();

      if (error) throw error;

      await logAdminActivity(
        authResult,
        "REVIEW_CREATED",
        "reviews",
        data.id,
        `Created testimonial from ${customerName}`
      );

      return NextResponse.json({
        success: true,
        data,
        message: "Testimonial created successfully.",
      });
    }

    const mock = { id: `rev_${Date.now()}`, ...newReview, created_at: new Date().toISOString() };
    memoryReviews.unshift(mock);

    return NextResponse.json({
      success: true,
      data: mock,
      message: "Testimonial created (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create review.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
