export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const ENTITY_ID = /^[\w-]{1,64}$/;

export const isEntityId = (value: unknown): value is string => typeof value === "string" && ENTITY_ID.test(value);

export const readTimestamp = (value: unknown, fallback: number) => {
  const timestamp = typeof value === "string" ? Date.parse(value) : value;
  return typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0 ? timestamp : fallback;
};
