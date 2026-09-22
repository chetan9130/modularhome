import { MapPin, Phone, Mail, Clock, HelpCircle } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { getPublicGlobalSettings } from "@/lib/settings";

export const metadata = {
  title: "Contact Our Team | ModularHome.com",
  description: "Connect with ModularHome.com housing specialists, project estimators, and designers. Request a quote or schedule a design consultation.",
};

const FAQS = [
  {
    q: "How long does manufacturing and delivery take?",
    a: "Standard modular homes and building kits are manufactured and delivered to your job site in 4 to 6 weeks from final signed engineering blueprint approval.",
  },
  {
    q: "Are the blueprints stamped for my local county?",
    a: "Yes. All ModularHome.com kits come with licensed engineering calculation packets wet-stamped for the specific county and state where you are building.",
  },
  {
    q: "What type of foundation is required?",
    a: "Our modular homes can be installed on an engineered concrete slab, crawlspace stem walls, or pier foundation runners depending on the model.",
  },
  {
    q: "Can I customize the floor plan?",
    a: "Yes! All floor plans are 100% customizable. You can adjust room dimensions, add porches, change window placements, or upload your own blueprint.",
  },
];

export default async function ContactPage() {
  const settings = await getPublicGlobalSettings();

  const phone = settings.phone || "+1 (812) 595-4033";
  const email = settings.email || "support@modularhome.com";
  const address = settings.address || "Factory Headquarters, IN & Nationwide Delivery";

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 text-[#101114]">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Direct Info & Editorial Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d97706] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#fcb907]"></span>
                <span>Get In Touch</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-2px] text-[#101114] leading-[0.95]">
                Let&apos;s Build <br />
                <span className="text-[#d97706]">Something Great.</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#6b7280] leading-relaxed">
                Whether you have existing architectural sketches or are starting with a blank slate, our licensed structural engineers and modular advisors are here to help.
              </p>
            </div>

            {/* Direct Channels */}
            <div className="space-y-3 pt-2 border-t border-[#e7e9ee]">
              {/* Phone Channels */}
              <div className="card p-4 flex items-start gap-3.5 bg-white">
                <div className="p-2.5 rounded-[9px] bg-[#fcb907]/15 text-[#d97706] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] uppercase font-bold text-[#6b7280]">Phone Numbers</div>
                  <div className="flex flex-col">
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                      className="text-base font-black text-[#101114] hover:text-[#d97706] transition-colors"
                    >
                      Direct: {phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Channel */}
              <div className="card p-4 flex items-start gap-3.5 bg-white">
                <div className="p-2.5 rounded-[9px] bg-[#fcb907]/15 text-[#d97706] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase font-bold text-[#6b7280]">Email Support & Quotes</div>
                  <a
                    href={`mailto:${email}`}
                    className="text-base font-black text-[#101114] hover:text-[#d97706] transition-colors break-all"
                  >
                    {email}
                  </a>
                  <div className="text-[11px] text-[#6b7280]">Prompt assistance with pricing, plans & consultations</div>
                </div>
              </div>

              {/* Address Channel */}
              <div className="card p-4 flex items-start gap-3.5 bg-white">
                <div className="p-2.5 rounded-[9px] bg-[#fcb907]/15 text-[#d97706] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase font-bold text-[#6b7280]">Headquarters & Delivery</div>
                  <div className="text-sm font-bold text-[#101114]">{address}</div>
                  <div className="text-[11px] text-[#6b7280]">Regional staging & certified installation crews across all 50 states</div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="card p-4 flex items-start gap-3.5 bg-white">
                <div className="p-2.5 rounded-[9px] bg-[#fcb907]/15 text-[#d97706] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase font-bold text-[#6b7280]">Consultation Hours</div>
                  <div className="text-sm font-bold text-[#101114]">Monday – Friday: 7:00 AM – 6:00 PM EST</div>
                  <div className="text-[11px] text-[#6b7280]">Saturday: 9:00 AM – 2:00 PM EST (By Appointment)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Project Consultation Form (7 cols) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="mt-20 pt-12 border-t border-[#e7e9ee]" id="faq">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d97706] mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#d97706]" />
              <span>Direct Guidance</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[#101114]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="card p-6 bg-white space-y-2">
                <h3 className="text-base font-black text-[#101114]">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-[#6b7280] leading-relaxed m-0">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
