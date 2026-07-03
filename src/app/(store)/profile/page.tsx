import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import ProfileForm from "./ProfileForm";

/** 个人中心页 */
export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/profile");

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProfileForm
          name={session.name}
          email={session.email}
        />
      </div>
    </div>
  );
}
