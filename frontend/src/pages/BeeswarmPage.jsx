import { useApp } from '../context/AppContext'

export default function BeeswarmPage() {
  const { foods, loading } = useApp()

  return (
    <div className="p-6">
      <h1 className="text-xl font-medium text-gray-800 mb-1">Caloric Density Explorer</h1>
      <p className="text-sm text-gray-400 mb-6">kcal per 100g — bubble size shows fat or carbs</p>

      {/* Debug panel — remove after S1-05-T3 verified */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        {loading ? (
          <p className="text-sm text-gray-400">⏳ Loading foods...</p>
        ) : (
          <>
            <p className="text-sm text-green-600 font-medium mb-3">
              ✓ {foods.length} foods loaded from API
            </p>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-1 pr-4 text-gray-400 font-medium">Tên món</th>
                    <th className="py-1 pr-4 text-gray-400 font-medium">Danh mục</th>
                    <th className="py-1 pr-4 text-gray-400 font-medium">Calories</th>
                    <th className="py-1 pr-4 text-gray-400 font-medium">Protein</th>
                    <th className="py-1 pr-4 text-gray-400 font-medium">Fat</th>
                    <th className="py-1 text-gray-400 font-medium">Carbs</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((f, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-1.5 pr-4 text-gray-800">{f.food_name}</td>
                      <td className="py-1.5 pr-4 text-gray-500">{f.category}</td>
                      <td className="py-1.5 pr-4 text-gray-500">{f.calories}</td>
                      <td className="py-1.5 pr-4 text-gray-500">{f.protein}g</td>
                      <td className="py-1.5 pr-4 text-gray-500">{f.fat}g</td>
                      <td className="py-1.5 text-gray-500">{f.carbs}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Beeswarm placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 h-64 flex items-center justify-center text-gray-300 text-sm">
        Beeswarm chart coming in Sprint 2
      </div>
    </div>
  )
}