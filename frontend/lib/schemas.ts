// Centralised validation schemas for API route inputs.
// Provides consistent error messages and type-safe output objects.
// TODO: Migrate to `zod` (z.object / z.string / safeParse) once npm registry is available.

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: true;
  data: T;
  errors: [];
}

export interface ValidationFailure {
  success: false;
  data: undefined;
  errors: ValidationError[];
}

export type ParseResult<T> = ValidationResult<T> | ValidationFailure;

function fail(errors: ValidationError[]): ValidationFailure {
  return { success: false, data: undefined, errors };
}

// ─── Comment ──────────────────────────────────

export interface CommentInput {
  text: string;
  rezensionId: string;
  website: string; // honeypot — must be empty string
}

export function parseComment(body: unknown): ParseResult<CommentInput> {
  if (!body || typeof body !== "object") {
    return fail([{ field: "body", message: "Ungültige Anfrage." }]);
  }

  const { text, rezensionId, website } = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (typeof text !== "string" || text.trim().length < 3) {
    errors.push({
      field: "text",
      message: "Kommentar muss mindestens 3 Zeichen lang sein.",
    });
  } else if (text.trim().length > 1000) {
    errors.push({
      field: "text",
      message: "Kommentar darf maximal 1000 Zeichen lang sein.",
    });
  }

  if (typeof rezensionId !== "string" || rezensionId.trim().length === 0) {
    errors.push({ field: "rezensionId", message: "Ungültige Rezensions-ID." });
  }

  if (errors.length > 0) return fail(errors);

  return {
    success: true,
    errors: [],
    data: {
      text: (text as string).trim(),
      rezensionId: (rezensionId as string).trim(),
      website: typeof website === "string" ? website : "",
    },
  };
}

// ─── Auth: Login ──────────────────────────────

export interface LoginInput {
  identifier: string;
  password: string;
}

export function parseLogin(body: unknown): ParseResult<LoginInput> {
  if (!body || typeof body !== "object") {
    return fail([{ field: "body", message: "Ungültige Anfrage." }]);
  }

  const { identifier, password } = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (typeof identifier !== "string" || identifier.trim().length === 0) {
    errors.push({ field: "identifier", message: "E-Mail oder Benutzername fehlt." });
  }

  if (typeof password !== "string" || password.length < 6) {
    errors.push({ field: "password", message: "Passwort muss mindestens 6 Zeichen lang sein." });
  }

  if (errors.length > 0) return fail(errors);

  return {
    success: true,
    errors: [],
    data: {
      identifier: (identifier as string).trim(),
      password: password as string,
    },
  };
}

// ─── Auth: Register ───────────────────────────

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export function parseRegister(body: unknown): ParseResult<RegisterInput> {
  if (!body || typeof body !== "object") {
    return fail([{ field: "body", message: "Ungültige Anfrage." }]);
  }

  const { username, email, password } = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (typeof username !== "string" || username.trim().length < 3) {
    errors.push({ field: "username", message: "Benutzername muss mindestens 3 Zeichen lang sein." });
  } else if (username.trim().length > 30) {
    errors.push({ field: "username", message: "Benutzername darf maximal 30 Zeichen lang sein." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email)) {
    errors.push({ field: "email", message: "Ungültige E-Mail-Adresse." });
  }

  if (typeof password !== "string" || password.length < 6) {
    errors.push({ field: "password", message: "Passwort muss mindestens 6 Zeichen lang sein." });
  }

  if (errors.length > 0) return fail(errors);

  return {
    success: true,
    errors: [],
    data: {
      username: (username as string).trim(),
      email: (email as string).trim().toLowerCase(),
      password: password as string,
    },
  };
}
