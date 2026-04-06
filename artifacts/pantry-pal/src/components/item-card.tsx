import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useUpdateItem,
  useDeleteItem,
  getListItemsQueryKey,
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Item } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LOCATION_PRESETS = [
  "Fridge",
  "Freezer",
  "Pantry",
  "Kitchen Shelf",
  "Bathroom",
  "Laundry Area",
  "Other",
];

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const queryClient = useQueryClient();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editUnit, setEditUnit] = useState(item.unit);
  const [editLocation, setEditLocation] = useState(item.location);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });

  const handleIncrement = () => {
    updateItem.mutate(
      { id: item.id, data: { quantity: item.quantity + 1 } },
      { onSuccess: invalidate }
    );
  };

  const handleDecrement = () => {
    if (item.quantity <= 0) return;
    updateItem.mutate(
      { id: item.id, data: { quantity: Math.max(0, item.quantity - 1) } },
      { onSuccess: invalidate }
    );
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    updateItem.mutate(
      {
        id: item.id,
        data: {
          name: editName.trim(),
          unit: editUnit.trim() || "pcs",
          location: editLocation.trim() || "Pantry",
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          invalidate();
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    setEditUnit(item.unit);
    setEditLocation(item.location);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteItem.mutate({ id: item.id }, { onSuccess: invalidate });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-card-border rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        {isEditing ? (
          <div className="flex-1 flex flex-col gap-2 mr-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-9 text-lg font-serif"
              placeholder="Item name"
              autoFocus
            />
            <div className="flex gap-2">
              <Input
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
                className="h-8 w-20 text-sm"
                placeholder="Unit"
              />
              <div className="flex-1 relative">
                <Input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Location"
                  list={`loc-list-${item.id}`}
                />
                <datalist id={`loc-list-${item.id}`}>
                  {LOCATION_PRESETS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-serif text-xl font-medium text-card-foreground truncate">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Updated {new Date(item.updatedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="flex gap-1 shrink-0">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-600"
                onClick={handleSaveEdit}
                disabled={updateItem.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between bg-muted/50 rounded-xl p-2 gap-4">
        <motion.button
          whileTap={item.quantity > 0 ? { scale: 0.9 } : undefined}
          onClick={handleDecrement}
          disabled={item.quantity <= 0 || updateItem.isPending}
          className="h-16 flex-1 flex items-center justify-center bg-card shadow-sm border border-border rounded-lg text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-8 w-8" />
        </motion.button>

        <div className="flex flex-col items-center justify-center min-w-[80px]">
          <span className="text-3xl font-serif font-semibold leading-none">
            {item.quantity}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {item.unit}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          disabled={updateItem.isPending}
          className="h-16 flex-1 flex items-center justify-center bg-primary shadow-sm text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-8 w-8" />
        </motion.button>
      </div>
    </motion.div>
  );
}
