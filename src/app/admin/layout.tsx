import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import LogoutButton from "@/components/layout/LogoutButton";

/** 后台管理布局——权限门控 + 侧边栏 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4">
          <span className="text-sm text-gray-600">
            {session.name}
          </span>
          <LogoutButton />
        </header>

        {/* 主内容区 */}
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
