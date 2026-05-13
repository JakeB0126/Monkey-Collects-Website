import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

function getSafeNextPath(nextPath?: string) {
  if (!nextPath?.startsWith("/admin") || nextPath.startsWith("/admin/login")) {
    return "/admin";
  }

  return nextPath;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Admin login</h1>
      <p className="mt-4 text-base leading-7 text-neutral-700">
        Enter the deployment admin password to manage products and orders.
      </p>
      <AdminLoginForm nextPath={getSafeNextPath(next)} />
    </div>
  );
}
