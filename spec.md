# ConstructManager Pro

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Full single-page marketing website for ConstructManager Pro
- Sticky navigation bar with logo, nav links, and CTA button
- Hero section: headline, tagline, CTA "Explore the Platform", hero construction site image
- Overview/Introduction section: problem statement + solution summary
- Role-Based Access Control section: grid of 4 role cards (Chief Engineer, Site Owner, Site Engineer, Material Engineer) with icons and permissions
- Material Management Module: mockup table (cement, steel, sand) with stock/reorder/price columns, low-stock red highlight, bar chart
- Labour & Attendance Module: worker list with GPS clock-in/out, wage calculation, summary card, calendar picker, Mark Attendance button
- Notification System: alert feed with priority badges, view-all link
- Key Features Highlights: icon grid (6 features)
- Technology Stack: badge strip (React/Angular, Python/Node.js, PostgreSQL, AWS/Azure, GPS APIs)
- Footer: copyright, contact email, tagline

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
- Static frontend-only React app (no backend needed — purely presentational landing page)
- Use Tailwind CSS for styling with navy/gray/orange/teal palette
- Recharts for the bar chart in the material management section
- All sections as individual React components in App.tsx
- Responsive layout with mobile-friendly breakpoints
