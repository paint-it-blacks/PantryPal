import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useUpdateItem, 
  useDeleteItem, 
  getListItemsQueryKey 
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Item } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const handleIncrement = () => {
    updateItem.mutate({
      id: item.id,
      data: { quantity: item.quantity + 1 }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
      }
    });
  };

  const handleDecrement = () => {
    if (item.quantity <= 0) return;
    updateItem.mutate({
      id: item.id,
      data: { quantity: Math.max(0, item.quantity - 1) }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    updateItem.mutate({
      id: item.id,
      data: { name: editName.trim(), unit: editUnit.trim() || "pcs" }
    }, {
      onSuccess: () => {
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
      }
    });
  };

  const handleDelete = () => {
    deleteItem.mutate({ id: item.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
      }
    });
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
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex-1 flex gap-2 items-center mr-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-8 text-lg font-serif"
              autoFocus
            />
            <Input
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              className="h-8 w-16 text-sm"
              placeholder="Unit"
            />
            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveEdit}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-serif text-xl font-medium text-card-foreground truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground">Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
          </div>
        )}

        {!isEditing && (
          <div className="flex gap-1 shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
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
          <span className="text-3xl font-serif font-semibold leading-none">{item.quantity}</span>
          <span className="text-sm font-medium text-muted-foreground">{item.unit}</span>
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
