# EMS Platform — Tailwind CSS Edition

## What Changed

### Design System Migration
- **Glassmorphic → Clean Flat**: Removed all blur effects, glass backgrounds, and gradient meshes
- **Teal → Indigo**: Brand color shifted from teal (#1a9a8a) to indigo (#4f46e5)  
- **Background**: Solid slate-50 (#f8fafc) instead of gradient mesh
- **Cards**: Solid white with subtle borders instead of frosted glass
- **Sidebar**: Clean white background, wider (240px), indigo active states
- **Typography**: Same DM Sans, but with slate color palette for better contrast

### Tailwind CSS Integration
- Tailwind CDN included via `<script>` tag in `head.ejs`
- Custom Tailwind config with brand colors and DM Sans font
- All sidebars (4) fully rewritten with Tailwind utility classes
- Login page fully rewritten with Tailwind utility classes
- Employee dashboard fully rewritten with Tailwind utility classes
- Remaining views work via updated CSS variables (same class names, new design tokens)

### Mobile Optimizations
- Touch targets: 44px minimum on coarse pointer devices  
- iOS zoom prevention: 16px minimum font-size on inputs
- Safe area padding for notched phones (iPhone X+)
- Reduced motion support for accessibility
- Sidebar overlay with backdrop blur on mobile
- Responsive stat grids (4-col → 2-col → 1-col)

### Production Ready
- No backdrop-filter (better performance on mobile)
- No floating blobs or heavy CSS effects
- Minimal box-shadows
- Clean hover states without transforms

## Setup

```bash
npm install
# Configure .env with your MySQL credentials
npm run dev
```

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@ems.com | Admin@123 |
| Admin | admin@demo.com | Admin@123 |
| Manager | manager@demo.com | Admin@123 |
| Employee | employee@demo.com | Admin@123 |

## Migration Guide (for remaining views)

The remaining EJS views still use the CSS class-based approach. To progressively migrate them to Tailwind:

1. Pick a view file (e.g., `views/employee/leaves.ejs`)
2. Replace `<div class="card">` with `<div class="bg-white border border-slate-200 rounded-2xl">`
3. Replace `<div class="card-header">` with `<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">`
4. Replace `<div class="stat-card">` with the Tailwind pattern from `employee/dashboard.ejs`
5. Use the dashboard and login as reference templates for all Tailwind patterns

### Key Tailwind Patterns
```html
<!-- Stat Card -->
<div class="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex items-center gap-3.5 hover:shadow-md transition-shadow">
  <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">ICON</div>
  <div>VALUE + LABEL</div>
</div>

<!-- Card -->
<div class="bg-white border border-slate-200 rounded-2xl">
  <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">HEADER</div>
  <div class="p-5">BODY</div>
</div>

<!-- Primary Button -->
<button class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all cursor-pointer">
```
