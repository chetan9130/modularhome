import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { logAdminActivity } from "@/lib/activityLog";

let memoryFaqs: any[] = [
  {
    id: "faq-1",
    question: "How long does it take from order to modular home delivery?",
    answer: "Standard precision-engineered modular home models are typically manufactured within 4 to 8 weeks in our controlled indoor factory environment, then delivered nationwide via heavy freight carriers ready for swift crane assembly.",
    category: "Delivery & Timeline",
    page_slug: "all",
    status: "PUBLISHED",
    display_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "faq-2",
    question: "What are the structural advantages of galvanized light-gauge steel framing?",
    answer: "Our 100% commercial-grade galvanized steel frames are impervious to rot, termites, warping, and mold. They offer superior strength-to-weight ratios with up to 150 MPH wind ratings and seismic resilience.",
    category: "Engineering & Materials",
    page_slug: "all",
    status: "PUBLISHED",
    display_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "faq-3",
    question: "What is included in downloadable digital blueprint packages?",
    answer: "Each downloadable blueprint package includes full architectural construction sheets (PDF + CAD DWG), structural steel framing diagrams, foundation details, and electrical/plumbing schematics ready for permit submission.",
    category: "Floor Plans & Store",
    page_slug: "all",
    status: "PUBLISHED",
    display_order: 3,
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from("faqs")
        .select("*")
        .order("display_order", { ascending: true });

      if (category && category !== "ALL") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }

    return NextResponse.json({ success: true, data: memoryFaqs });
  } catch (error: any) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch FAQs.", code: "FAQS_FETCH_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { question, answer, category, pageSlug, status, displayOrder } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: { message: "Question and answer are required.", code: "VALIDATION_ERROR" } },
        { status: 400 }
      );
    }

    const newFaq = {
      question,
      answer,
      category: category || "General",
      page_slug: pageSlug || "all",
      status: status || "PUBLISHED",
      display_order: Number(displayOrder) || 0,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("faqs")
        .insert(newFaq)
        .select()
        .single();

      if (error) throw error;

      await logAdminActivity(
        authResult,
        "FAQ_CREATED",
        "faqs",
        data.id,
        `Created FAQ: "${question.slice(0, 40)}..."`
      );

      return NextResponse.json({
        success: true,
        data,
        message: "FAQ created successfully.",
      });
    }

    const mock = { id: `faq_${Date.now()}`, ...newFaq, created_at: new Date().toISOString() };
    memoryFaqs.push(mock);

    return NextResponse.json({
      success: true,
      data: mock,
      message: "FAQ created (offline fallback).",
    });
  } catch (error: any) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to create FAQ.", code: "CREATE_ERROR" } },
      { status: 500 }
    );
  }
}
