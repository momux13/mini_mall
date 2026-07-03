import Link from "next/link";

/** 认证页面布局——居中卡片，无 Header/Footer */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🛒 Mini Mall
          </Link>
        </div>

        {/* 卡片内容 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
