export const WIZARD_INTENTS = [
  {
    key: "scan",
    choice: "1",
    label: "Quick domain scan",
    description: "Registrar, DNS, hosting, CMS, email, launch URL, and access basics.",
    command: "scan",
    deep: false,
    search: false,
  },
  {
    key: "handoff",
    choice: "2",
    label: "Client onboarding handoff",
    description: "Domain scan plus practical access and previous-developer handoff packet.",
    command: "scan",
    deep: false,
    search: false,
  },
  {
    key: "snapshot",
    choice: "3",
    label: "FitFo Snapshot",
    description: "Light first-call walkthrough for site positioning, gaps, and next-step opportunities.",
    command: "snapshot",
    deep: true,
    search: true,
  },
  {
    key: "kickoff",
    choice: "4",
    label: "Kickoff research brief",
    description: "Deep crawl, market research, positioning prompts, and first-call agenda.",
    command: "brief",
    deep: true,
    search: true,
  },
  {
    key: "plan",
    choice: "5",
    label: "Client build plan",
    description: "Deep crawl, market research, recommended structure, and build workstreams.",
    command: "plan",
    deep: true,
    search: true,
  },
];

export function normalizeWizardIntent(value, fallback = "snapshot") {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return getWizardIntent(fallback);

  const match = WIZARD_INTENTS.find((intent) => (
    intent.choice === normalized
    || intent.key === normalized
    || intent.label.toLowerCase() === normalized
  ));

  if (!match) {
    throw new Error(`Unsupported FITFO intent "${value}". Choose 1, 2, 3, 4, or 5.`);
  }

  return match;
}

export function applyWizardIntent(options, intent) {
  const next = {
    ...options,
    command: intent.command,
    deep: intent.deep,
    search: intent.search,
    wizardIntent: intent.key,
  };
  preserveProvided(options, next);
  return next;
}

export function shouldAskForWizardLocation(options) {
  return Boolean(options.search && !options.location);
}

function getWizardIntent(key) {
  return WIZARD_INTENTS.find((intent) => intent.key === key) || WIZARD_INTENTS[0];
}

function preserveProvided(source, target) {
  if (source.provided instanceof Set) {
    Object.defineProperty(target, "provided", {
      value: new Set(source.provided),
      enumerable: false,
    });
  }
}
