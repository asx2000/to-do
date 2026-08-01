# To-Do App Simplification Plan

## Why

The app (v1.8) has grown two parallel systems doing similar jobs: **Tasks** (with recurrence, lead-time reminders, notifications, single "blocked by" dependency, multi-category) and **Projects** (a separate entity with ordered "steps," their own sequential/blockedBy logic, recurrence, and expiry). That duplication is most of the complexity.

The fix: collapse everything into **one entity — the Task** — and let dependencies do the job Projects were doing.

## Core idea: dependencies replace "Projects"

A Project with sequential steps ("1. Draft, 2. Review, 3. Send") is just a chain of tasks where each one is blocked by the previous one. Instead of maintaining two systems, we model it as:

- Task "Draft" (no blocker)
- Task "Review" — blocked by "Draft"
- Task "Send" — blocked by "Review"

Same visual result (locked/greyed steps until the prior one is done), same "Blocks N tasks" badge, but one data model and one card type instead of two.

## What's kept (as-is or near-as-is)

- **Styling** — colors, radius, shadows, dark mode, fonts: unchanged. This is a data-model and screen-count simplification, not a redesign.
- **Urgency** — Critical/High/Medium/Low, auto-set from due date, colored bar + pills.
- **Due dates** — with "Due today / Due in Nd / overdue" badges and the pulsing overdue alert.
- **Dependencies ("Blocked by")** — a task can be blocked by one other task; blocked tasks show a lock icon and can't be checked off; a task shows "Blocks N tasks" if others depend on it. This is the one relationship kept exactly as it works today.
- **Notes** field.
- **Completed section** (collapsible).
- **Settings**: manage tags, clear completed, force-update/clear cache.
- **PWA shell**: manifest, service worker, offline caching, installability.
- Snackbar confirmations, swipe/tap interactions, empty states.

## What changes

- **Categories → Tags.** Already multi-select under the hood (`categories: []`); we just rename it in the UI/data (`tags: []`) and — new — show tag chips directly on the task card (today tags only drive the filter bar, they're invisible on the card itself). Filter bar stays single-select-at-a-time for simplicity (tap a tag to filter, tap "All" to clear).
- **One "+" button.** Replace the "+ Project" / "+ Task" pair in the header with a single "+" — there's only one kind of item now.
- **One list, one card type.** No more project cards with progress bars/chevrons/expand-collapse — every row in the list is a task card.

## What's cut

- **Projects entity** (name, steps array, per-step blockedBy, sequential toggle, expiry, recurrence) — superseded by chaining tasks with "Blocked by."
- **Recurring tasks** (daily/weekdays/weekly/monthly patterns, day-of-week/month pickers, auto-reset-on-complete logic).
- **Reminders & notifications** (lead-time reminder pills, notification permission request, scheduled alerts, in-app alert banners).
- **Manual drag-to-reorder** — active tasks sort by urgency → due date → created date, same as today's default order when not manually dragged. Removing the drag handle removes a class of ordering bugs and simplifies the card markup.

## New data model

```js
// Task
{
  id: string,
  title: string,
  tags: string[],        // was: categories[]
  urgency: 'critical' | 'high' | 'medium' | 'low',
  dueDate: string | null,        // 'YYYY-MM-DD'
  notes: string,
  blockedBy: string | null,      // id of the task this one depends on
  completed: boolean,
  createdAt: string,
  updatedAt: string
}
```

Removed fields: `recurring`, `recurrence`, `alertTime`, `alertDayOfWeek`, `alertDayOfMonth`, `reminders`, `firedDates`, `goalId`, `sortOrder`. Removed top-level: `projects[]`.

## Migration (no data loss)

On first load under the new version:

1. `categories` → `tags` (straight rename, values unchanged).
2. Each existing **Project** is converted into a set of **Tasks**, one per step, tagged with the project's name, chained in order via `blockedBy` (respecting the old "sequential" flag — if a project wasn't sequential, the converted tasks just won't have `blockedBy` set between them). Project recurrence/expiry are dropped; a snackbar/summary tells the user "Converted N projects to tasks."
3. Existing task `blockedBy` links carry over unchanged (same task IDs).
4. Recurring/reminder fields are simply dropped from existing tasks; a still-open recurring task is kept as a regular one-off task rather than deleted, so nothing silently disappears.

## Screens (unchanged count, simpler content)

1. **List** — header (title, count, gear, +), tag filter pills, task cards, collapsible Completed section.
2. **Add/Edit Task modal** — Title, Tags (multi-select chips), Urgency, Due date, Blocked by (dropdown of other open tasks), Notes, Save/Cancel, Delete (edit only).
3. **Settings modal** — manage tags, clear completed, force update, version number.

## Suggested build order

1. Strip Projects UI + logic, recurring/reminders/notifications UI + logic (biggest line-count reduction).
2. Rename categories → tags; add tag chips to the task card.
3. Write the migration step (categories rename + project→task conversion) and bump `VERSION`.
4. Remove the drag-reorder handle/listeners.
5. Re-test: add/edit/delete, tag filter, blocked-by chain (A blocks B blocks C), overdue pulse, dark mode, PWA install/offline.
