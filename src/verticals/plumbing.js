export const plumbingProfile = {
  slug: "plumbing",
  label: "Plumbing / home services",
  parent: "home-services",
  detect: [
    /\bplumb(?:er|ers|ing)?\b/i,
    /\bdrain cleaning\b/i,
    /\bsewer (?:line |drain )?(?:repair|replacement|cleaning)\b/i,
    /\bwater heater(?:s)?\b/i,
    /\bleak (?:detection|repair)\b/i,
  ],
  services: [
    "emergency plumbing",
    "drain cleaning",
    "sewer line repair",
    "water heater repair",
    "water heater installation",
    "leak detection",
    "pipe repair",
    "toilet repair",
    "garbage disposal repair",
    "commercial plumbing",
  ],
  proofAssets: [
    "license and insurance details",
    "recent Google reviews",
    "service truck and technician photos",
    "before/after job photos",
    "warranty or workmanship guarantee",
    "financing or payment options",
    "emergency availability policy",
    "brand/equipment certifications",
  ],
  operationsTools: [
    "ServiceTitan",
    "Housecall Pro",
    "Jobber",
    "FieldEdge",
    "Service Fusion",
    "Workiz",
    "CallRail",
    "Podium",
    "Birdeye",
    "NiceJob",
  ],
  audienceQuestions: [
    {
      audience: "Owner",
      question: "Which plumbing jobs are most valuable right now: emergency calls, drains, sewer, water heaters, remodels, commercial, or maintenance?",
    },
    {
      audience: "Office / dispatcher",
      question: "What happens after a homeowner calls, submits a form, or books online, and where can that handoff fail?",
    },
    {
      audience: "Office / dispatcher",
      question: "Which service areas, hours, after-hours rules, and capacity limits should the website make clear?",
    },
    {
      audience: "Previous developer",
      question: "Which forms, tracking numbers, booking widgets, thank-you pages, and CRM automations are active today?",
    },
    {
      audience: "Client",
      question: "Which reviews, photos, licenses, guarantees, financing offers, and technician/team details can we use publicly?",
    },
  ],
};

export function buildPlumbingHomeownerUx(scan = {}) {
  const pages = scan.site?.pages || [];
  const summary = scan.site?.summary || {};
  const haystack = searchableText(scan);
  const ctas = summary.ctas || [];
  const phones = summary.phonesDetected || [];
  const forms = pages.flatMap((page) => page.forms || []);
  const toolSignals = [
    ...(summary.toolSignals || []),
    ...(scan.analysis?.operations?.found || []),
  ];

  return [
    {
      area: "Emergency contact path",
      status: /\bemergency|24\/?7|after[-\s]?hours\b/i.test(haystack) && (phones.length || ctas.length)
        ? "Strong signal"
        : "Needs review",
      evidence: phones.length
        ? `Phone detected: ${phones.slice(0, 2).join(", ")}`
        : "No crawled phone number detected.",
      recommendation: "Make the emergency phone path obvious on mobile and confirm after-hours handling.",
    },
    {
      area: "Lead capture",
      status: forms.length || ctas.length ? "Present" : "Missing from crawl",
      evidence: forms.length
        ? `${forms.length} form(s) detected.`
        : ctas.length
          ? `CTA(s): ${ctas.slice(0, 3).join(", ")}`
          : "No forms or service CTAs detected in crawled pages.",
      recommendation: "Confirm form routing, spam handling, thank-you pages, and conversion tracking before launch.",
    },
    {
      area: "Trust proof",
      status: /\breview|testimonial|licensed|insured|guarantee|warranty\b/i.test(haystack) ? "Visible signal" : "Needs proof",
      evidence: matchedTerms(haystack, ["review", "testimonial", "licensed", "insured", "guarantee", "warranty"]).join(", ") || "No obvious proof terms found.",
      recommendation: "Surface reviews, licensing, insurance, guarantees, photos, and service-specific proof near conversion paths.",
    },
    {
      area: "Service-area clarity",
      status: /\b(service area|areas served|near me|locations?|city|county)\b/i.test(haystack) ? "Visible signal" : "Needs confirmation",
      evidence: matchedTerms(haystack, ["service area", "areas served", "location", "county", "near me"]).join(", ") || "No obvious service-area wording found.",
      recommendation: "Confirm real service areas before creating city pages or local claims.",
    },
    {
      area: "Dispatch and attribution",
      status: toolSignals.length ? "Tool signal found" : "Ask client",
      evidence: toolSignals.length ? toolSignals.join(", ") : "No field-service, call tracking, or reputation tool detected publicly.",
      recommendation: "Confirm CRM, booking, dispatch, call tracking, and review platform ownership with the office team.",
    },
  ];
}

function searchableText(scan = {}) {
  return [
    scan.http?.title,
    ...(scan.site?.pages || []).flatMap((page) => [
      page.path,
      page.title,
      page.metaDescription,
      ...(page.headings?.h1 || []),
      ...(page.headings?.h2 || []),
      ...(page.ctas || []),
      ...(page.schemaTypes || []),
    ]),
    ...(scan.research?.results || []).flatMap((result) => [
      result.title,
      result.description,
      result.url,
    ]),
  ].filter(Boolean).join(" ");
}

function matchedTerms(haystack, terms) {
  const lowered = String(haystack || "").toLowerCase();
  return terms.filter((term) => lowered.includes(term));
}
