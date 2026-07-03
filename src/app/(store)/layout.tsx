import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/** 商城主布局——所有 (store) 页面共享 Header + Footer */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
