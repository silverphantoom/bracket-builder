import { cookies } from "next/headers";

const VOTER_COOKIE = "bb_voter_id";
const CREATOR_COOKIE = "bb_creator_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ONE_YEAR,
};

export async function getOrCreateVoterId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VOTER_COOKIE);
  if (existing?.value) return existing.value;

  const id = crypto.randomUUID();
  store.set(VOTER_COOKIE, id, cookieOptions);
  return id;
}

export async function getVoterId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(VOTER_COOKIE)?.value;
}

export async function setCreatorToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(CREATOR_COOKIE, token, cookieOptions);
}

export async function getCreatorToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CREATOR_COOKIE)?.value;
}
