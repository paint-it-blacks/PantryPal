import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateItem, getListItemsQueryKey } from "@workspace/api-client-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  quantity: z.coerce.number().min(0),
  unit: z.string().max(30).optional().default("pcs"),
  location: z.string().min(1, "Location is required").max(100).default("Pantry"),
});

export function AddItemSheet() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const createItem = useCreateItem();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unit: "pcs",
      location: "Pantry",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createItem.mutate(
      {
        data: {
          name: values.name,
          quantity: values.quantity,
          unit: values.unit || "pcs",
          location: values.location || "Pantry",
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg shadow-primary/20 p-0 z-50 transition-transform hover:scale-105"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl sm:max-w-[430px] sm:mx-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-serif text-2xl text-left">Add to Pantry</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">What do you have?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Flour, Eggs, Coffee beans"
                      className="h-12 text-lg bg-muted/30 border-muted"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Where is it?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Fridge, Pantry, Bathroom..."
                      className="h-12 text-lg bg-muted/30 border-muted"
                      list="location-presets"
                      {...field}
                    />
                  </FormControl>
                  <datalist id="location-presets">
                    {LOCATION_PRESETS.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-muted-foreground">Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-12 text-lg bg-muted/30 border-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-muted-foreground">Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="pcs, kg, bags"
                        className="h-12 text-lg bg-muted/30 border-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-medium"
              disabled={createItem.isPending}
            >
              {createItem.isPending ? "Adding..." : "Add to Pantry"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
