import React from 'react';
import { MealGroceryPlannerData, MealDayPlan, GroceryItem } from '../../types/planner';
import { ProgressBar } from '../ProgressBar';
import { Plus, Trash2, Check, Utensils, ShoppingCart } from 'lucide-react';

interface MealGroceryPlannerViewProps {
  data: MealGroceryPlannerData;
  onChange: (updated: MealGroceryPlannerData) => void;
}

export const MealGroceryPlannerView: React.FC<MealGroceryPlannerViewProps> = ({
  data,
  onChange,
}) => {
  const totalGroceries = data.groceries.length;
  const completedGroceries = data.groceries.filter((g) => g.done).length;

  // Meal plan
  const updateMealDay = (id: string, field: keyof MealDayPlan, val: string) => {
    onChange({
      ...data,
      meals: data.meals.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
    });
  };

  // Grocery item
  const addGroceryItem = (defaultCategory: GroceryItem['category'] = 'Produce') => {
    const newItem: GroceryItem = {
      id: `gi-${Date.now()}`,
      name: '',
      category: defaultCategory,
      quantity: '1',
      done: false,
    };
    onChange({ ...data, groceries: [...data.groceries, newItem] });
  };

  const toggleGroceryDone = (id: string) => {
    onChange({
      ...data,
      groceries: data.groceries.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    });
  };

  const updateGrocery = (id: string, field: keyof GroceryItem, val: any) => {
    onChange({
      ...data,
      groceries: data.groceries.map((g) => (g.id === id ? { ...g, [field]: val } : g)),
    });
  };

  const removeGrocery = (id: string) => {
    onChange({
      ...data,
      groceries: data.groceries.filter((g) => g.id !== id),
    });
  };

  const categories: GroceryItem['category'][] = [
    'Produce',
    'Protein',
    'Pantry',
    'Dairy & Chilled',
    'Bakery',
    'Other',
  ];

  return (
    <div className="space-y-6">
      <ProgressBar
        completed={completedGroceries}
        total={totalGroceries}
        label="Grocery Shopping Progress"
      />

      {/* Header Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Planner Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full font-bold text-lg text-slate-800 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Week
          </label>
          <input
            type="text"
            value={data.weekOf}
            onChange={(e) => onChange({ ...data, weekOf: e.target.value })}
            className="w-full text-slate-700 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Weekly Meal Plan Grid */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" />
              Weekly Meal Schedule (Mon – Sun)
            </h3>
            <p className="text-xs text-slate-500">Plan your dinners & lunches to avoid food waste</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                <th className="p-2 w-24">Day</th>
                <th className="p-2">Breakfast</th>
                <th className="p-2">Lunch</th>
                <th className="p-2">Dinner</th>
                <th className="p-2">Snacks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.meals.map((meal) => (
                <tr key={meal.id} className="hover:bg-slate-50/50">
                  <td className="p-2 font-bold text-slate-700">{meal.day}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={meal.breakfast}
                      onChange={(e) => updateMealDay(meal.id, 'breakfast', e.target.value)}
                      placeholder="Breakfast..."
                      className="w-full bg-slate-50/60 border border-slate-200/60 rounded px-2 py-1 text-slate-700 focus:outline-hidden"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={meal.lunch}
                      onChange={(e) => updateMealDay(meal.id, 'lunch', e.target.value)}
                      placeholder="Lunch..."
                      className="w-full bg-slate-50/60 border border-slate-200/60 rounded px-2 py-1 text-slate-700 focus:outline-hidden"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={meal.dinner}
                      onChange={(e) => updateMealDay(meal.id, 'dinner', e.target.value)}
                      placeholder="Dinner..."
                      className="w-full bg-emerald-50/40 border border-emerald-200/60 rounded px-2 py-1 text-emerald-950 font-medium focus:outline-hidden"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={meal.snacks}
                      onChange={(e) => updateMealDay(meal.id, 'snacks', e.target.value)}
                      placeholder="Snacks..."
                      className="w-full bg-slate-50/60 border border-slate-200/60 rounded px-2 py-1 text-slate-600 focus:outline-hidden"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categorized Grocery List */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              Categorized Grocery List
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by supermarket section for faster shopping
            </p>
          </div>
          <button
            type="button"
            onClick={() => addGroceryItem('Produce')}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
          >
            <Plus className="w-3.5 h-3.5" /> Add item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const items = data.groceries.filter((g) => g.category === cat);
            return (
              <div
                key={cat}
                className="border border-slate-200/80 rounded-xl p-3 bg-slate-50/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="font-bold text-xs text-slate-700">{cat}</span>
                    <button
                      type="button"
                      onClick={() => addGroceryItem(cat)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold print:hidden"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-1.5 min-h-[50px]">
                    {items.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic py-2 text-center">
                        No items
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1.5 text-xs p-1 bg-white rounded-lg border border-slate-200/60"
                        >
                          <button
                            type="button"
                            onClick={() => toggleGroceryDone(item.id)}
                            className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                              item.done
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateGrocery(item.id, 'name', e.target.value)}
                            placeholder="Item name..."
                            className={`w-full bg-transparent border-none focus:outline-hidden ${
                              item.done ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          />
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => updateGrocery(item.id, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-14 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] text-slate-600 text-center shrink-0"
                          />
                          <button
                            type="button"
                            onClick={() => removeGrocery(item.id)}
                            className="p-0.5 text-slate-300 hover:text-red-600 print:hidden"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prep Notes */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Meal Prep & Batch Cooking Notes
        </label>
        <textarea
          value={data.prepNotes}
          onChange={(e) => onChange({ ...data, prepNotes: e.target.value })}
          placeholder="e.g. Batch cook grains and roast root vegetables on Sunday; marinate chicken overnight on Tuesday..."
          rows={2}
          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden resize-none"
        />
      </div>
    </div>
  );
};
