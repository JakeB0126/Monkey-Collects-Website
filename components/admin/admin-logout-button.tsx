import { logoutAdmin } from "@/app/admin/login/actions";

export function AdminLogoutButton() {
  return (
    <form action={logoutAdmin}>
      <button
        type="submit"
        className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-neutral-100"
      >
        Log out
      </button>
    </form>
  );
}
