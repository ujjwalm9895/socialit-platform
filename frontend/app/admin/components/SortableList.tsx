"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem<T>({
  id,
  item,
  render,
  onRemove,
}: {
  id: string;
  item: T;
  render: (item: T) => React.ReactNode;
  onRemove?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 bg-white ${
        isDragging ? "border-primary shadow-lg z-10" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">{render(item)}</div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function SortableList<T extends { id?: string }>({
  items,
  setItems,
  getItemId,
  renderItem,
  onAdd,
  addLabel = "Add item",
  emptyMessage = "No items. Add one above.",
  title,
}: {
  items: T[];
  setItems: (items: T[]) => void;
  getItemId: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
  addLabel?: string;
  emptyMessage?: string;
  title?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = items.map((item, i) => getItemId(item, i));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    setItems(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-medium text-slate-700">{title}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors text-sm font-medium"
        >
          + {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">{emptyMessage}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={getItemId(item, index)}>
                  <SortableItem
                    id={getItemId(item, index)}
                    item={item}
                    render={() => renderItem(item, index)}
                    onRemove={() => setItems(items.filter((_, i) => i !== index))}
                  />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
