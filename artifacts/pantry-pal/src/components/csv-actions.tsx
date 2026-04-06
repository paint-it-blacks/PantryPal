import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getListItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Item } from "@workspace/api-client-react/src/generated/api.schemas";

interface CsvActionsProps {
  items: Item[];
}

function escapeCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

export function CsvActions({ items }: CsvActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleExport = () => {
    const rows = [
      ["name", "quantity", "unit", "location"],
      ...items.map((item) => [
        escapeCell(item.name),
        String(item.quantity),
        escapeCell(item.unit),
        escapeCell(item.location),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pantrypal-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${items.length} item${items.length !== 1 ? "s" : ""}` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    let text: string;
    try {
      text = await file.text();
    } catch {
      toast({ title: "Could not read file", variant: "destructive" });
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      toast({ title: "CSV has no data rows", variant: "destructive" });
      return;
    }

    const headers = parseCSVLine(lines[0]).map((h) =>
      h.trim().toLowerCase().replace(/"/g, "")
    );
    const nameIdx = headers.findIndex((h) => h === "name");
    const qtyIdx = headers.findIndex((h) => h === "quantity");
    const unitIdx = headers.findIndex((h) => h === "unit");
    const locIdx = headers.findIndex((h) =>
      ["location", "attribute_location"].includes(h)
    );

    if (nameIdx === -1) {
      toast({
        title: 'CSV must have a "name" column',
        variant: "destructive",
      });
      return;
    }

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const cells = parseCSVLine(lines[i]);
        const name = (cells[nameIdx] ?? "").trim();
        if (!name) {
          skipped++;
          continue;
        }

        const quantityRaw =
          qtyIdx >= 0 ? parseFloat(cells[qtyIdx] ?? "") : NaN;
        const quantity =
          isNaN(quantityRaw) || quantityRaw < 0
            ? 1
            : Math.round(quantityRaw * 100000) / 100000;
        const unit =
          unitIdx >= 0 ? (cells[unitIdx] ?? "").trim() || "pcs" : "pcs";
        const locationRaw =
          locIdx >= 0 ? (cells[locIdx] ?? "").trim() : "";
        const location = locationRaw || "undefined";

        const res = await fetch(`${baseUrl}/api/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, quantity, unit, location }),
        });
        if (res.ok) {
          imported++;
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }

    await queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
    toast({
      title: "Import complete",
      description: `${imported} added${skipped > 0 ? `, ${skipped} skipped` : ""}`,
    });
  };

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-8 px-2.5 text-muted-foreground hover:text-foreground gap-1.5"
        onClick={handleExport}
        disabled={items.length === 0}
        title="Export as CSV"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="text-xs">Export</span>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 px-2.5 text-muted-foreground hover:text-foreground gap-1.5"
        onClick={() => fileInputRef.current?.click()}
        title="Import from CSV"
      >
        <Upload className="h-3.5 w-3.5" />
        <span className="text-xs">Import</span>
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
