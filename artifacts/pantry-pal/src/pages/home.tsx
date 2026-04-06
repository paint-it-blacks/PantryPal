import { useListItems } from "@workspace/api-client-react";
import { ItemCard } from "@/components/item-card";
import { AddItemSheet } from "@/components/add-item-sheet";
import { PackageOpen, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOCATION_ORDER = [
  "Fridge",
  "Freezer",
  "Pantry",
  "Kitchen Shelf",
  "Bathroom",
  "Laundry Area",
  "Other",
];

function sortLocations(locations: string[]): string[] {
  return [...locations].sort((a, b) => {
    const ai = LOCATION_ORDER.indexOf(a);
    const bi = LOCATION_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function Home() {
  const { data: items, isLoading, isError } = useListItems();

  const grouped = items
    ? items.reduce<Record<string, typeof items>>((acc, item) => {
        const loc = item.location || "Other";
        if (!acc[loc]) acc[loc] = [];
        acc[loc].push(item);
        return acc;
      }, {})
    : {};

  const sortedLocations = sortLocations(Object.keys(grouped));

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center">
      <div className="w-full max-w-[430px] flex-1 flex flex-col px-4 pt-12 pb-24 relative">
        <header className="mb-8 px-2">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2 tracking-tight">PantryPal</h1>
          <p className="text-muted-foreground">Your always-open kitchen brain.</p>
        </header>

        <main className="flex-1 flex flex-col">
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium">Checking the shelves...</p>
            </div>
          )}

          {isError && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4 bg-destructive/10 rounded-3xl border border-destructive/20">
              <p className="text-destructive font-medium mb-2">Oops, couldn't open the pantry.</p>
              <p className="text-sm text-destructive/80">Please check your connection and try again.</p>
            </div>
          )}

          {!isLoading && !isError && items?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6 border-2 border-dashed border-border rounded-3xl"
            >
              <div className="h-20 w-20 bg-accent rounded-full flex items-center justify-center mb-6">
                <PackageOpen className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-2">Your pantry is empty</h2>
              <p className="text-muted-foreground text-sm">Tap the button below to start adding your kitchen essentials.</p>
            </motion.div>
          )}

          {!isLoading && !isError && items && items.length > 0 && (
            <AnimatePresence mode="popLayout">
              {sortedLocations.map((location, locIndex) => (
                <motion.section
                  key={location}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: locIndex * 0.04 }}
                >
                  {locIndex > 0 && (
                    <hr className="border-border my-6" />
                  )}
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
                    {location}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {grouped[location].map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          )}
        </main>
      </div>

      <AddItemSheet />
    </div>
  );
}
