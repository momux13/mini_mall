import CategoryForm from "./CategoryForm";

/** 新增分类页 */
export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新增分类</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-xl">
        <CategoryForm />
      </div>
    </div>
  );
}
