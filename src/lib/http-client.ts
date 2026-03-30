type ApiErrorBody = { error?: string };

export async function readJsonErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchJsonOrThrow<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  if (!res.ok) {
    const message = await readJsonErrorMessage(res, fallbackMessage);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
