import { fetchJsonOrThrow } from "@/lib/http-client";

export type PatchProfileBody = {
  name?: string;
  password?: string;
  currentPassword?: string;
};

export async function patchUserProfile(
  data: PatchProfileBody
): Promise<unknown> {
  const res = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return fetchJsonOrThrow(res, "Failed to update profile");
}

export async function deleteUserAccount(): Promise<unknown> {
  const res = await fetch("/api/user/account/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return fetchJsonOrThrow(res, "Failed to delete account");
}
