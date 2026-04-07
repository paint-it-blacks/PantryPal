# PantryPal
“Pantry Inventory ahh”

## PantryPal v3 is live. Here's what changed:

1. Decimal quantities

* The database column was upgraded from whole numbers to floating-point, so values like 0.5, 2.25, or 10.5 are fully supported
* Arithmetic uses safe rounding (Math.round(n * 100000) / 100000) to prevent the classic 0.1 + 0.2 = 0.30000000004 display bug
* Quantities display cleanly — 12 shows as 12, not 12.0

2. Step selector

* A compact row of step buttons — 0.1 | 0.5 | 1 | 5 | 10 — sits above the big +/− buttons on every card
* The active step is highlighted in orange; tapping a different step switches both +/− buttons to that increment
* Default step is 1, as before — so it still feels like "tap once, done" unless you need more precision

3. Backward compatibility

* Any item with a missing or empty location now falls into an "Undefined" section instead of silently defaulting to Pantry
* Existing data is fully safe — the quantity column upgrade (integer → float) is a lossless migration in PostgreSQL

4. CSV import/export

* Export — the Export button in the top-right header downloads a clean CSV with columns: name, quantity, unit, location, with today's date in the filename
* Import — the Import button lets you pick a CSV file; it parses each row, skips invalid ones without crashing, and creates the items with correct location grouping. Rows missing a location default to "undefined"

## Here's what was fixed:

Root cause 1 — Backend: The create-item route was destructuring name, quantity, and unit from the request but silently dropping location. So every new item ignored the user's chosen location and fell through to the database default of "Pantry".

Root cause 2 — Frontend: The grouping used item.location as a raw string key, so "Fridge" and "fridge" created two separate sections instead of one.

What's fixed now:

* The API correctly saves whatever location the user provides
* Grouping normalizes to lowercase for comparison, so "Fridge", "fridge", and "FRIDGE" all land in the same section
* The section header displays a clean title-cased version of the first seen value
* Any new string — like "Bathroom Cabinet" or "Garage" — automatically creates its own section with no fallback to Pantry
* Known locations (Fridge, Freezer, Pantry, etc.) still appear in the preferred stable order; unknown custom ones sort alphabetically after

## PantryPal v2 is live. Here's what changed:

New: Location grouping

* Every item now has a location field (Fridge, Freezer, Pantry, Kitchen Shelf, Bathroom, Laundry Area — or any custom text you type)
* The main list is now grouped by location with clear uppercase headers and a clean horizontal divider between each section
* Locations follow a stable order (Fridge → Freezer → Pantry → Kitchen Shelf → Bathroom → Laundry Area → custom)

Adding items — the "Add to Pantry" sheet now has a "Where is it?" field with suggestions that appear as you type (just tap one to select, or type anything custom)

Editing items — the edit mode on each card now includes a location field with the same suggestions, so you can move an item to a different section and it jumps there immediately

Everything else stays exactly as it was — big tap buttons, quantity floor at 0, fast one-tap interaction.

## PantryPal is up and running! Here's what was built:

PantryPal — your always-open kitchen brain:

* Item cards with large, bold +1 and −1 buttons for quick tapping — warm orange color that's easy to spot
* Quantity stays at 0 — the minus button disables when you've hit zero, no negatives possible
* Add items via the floating + button in the corner — a simple sheet slides up with name, unit, and quantity fields
* Edit or delete any item with the pencil and trash icons on each card
* Sorts by most recently updated — whatever you just tapped floats to the top
* Persists to PostgreSQL — your pantry survives page refreshes and restarts
* Comes pre-loaded with 5 example items (Eggs, Cup Ramen, Soap, Milk, Oats) so it feels alive right away
