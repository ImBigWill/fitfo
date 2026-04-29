export function shouldAskForOnboardLocation(options = {}) {
  return Boolean(options.command === "onboard" && options.search && !options.location);
}

export function shouldAskForOnboardVault(options = {}) {
  return Boolean(
    options.command === "onboard"
    && !options.out
    && !options.vault
    && (options.onboardFileFormat || "obsidian") === "obsidian"
  );
}

export function shouldPromptForOnboardDetails(options = {}, io = {}) {
  return Boolean(
    options.command === "onboard"
    && !options.quiet
    && io.inputIsTTY === true
    && io.outputIsTTY === true
    && (shouldAskForOnboardLocation(options) || shouldAskForOnboardVault(options))
  );
}

export function applyOnboardPromptAnswers(options = {}, answers = {}) {
  const next = { ...options };
  preserveProvided(options, next);

  const location = cleanAnswer(answers.location);
  const vault = cleanAnswer(answers.vault);

  if (location) {
    next.location = location;
  }

  if (vault) {
    next.vault = vault;
  }

  return next;
}

export function defaultOnboardVault(options = {}) {
  return options.vault || "fitfo-reports";
}

function cleanAnswer(value) {
  return String(value || "").trim();
}

function preserveProvided(source, target) {
  if (source.provided instanceof Set) {
    Object.defineProperty(target, "provided", {
      value: new Set(source.provided),
      enumerable: false,
    });
  }
}
