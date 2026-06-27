Pill-shaped brand button for primary and secondary actions across Clara's surfaces.

```jsx
<Button variant="primary" size="lg">Reserve the patio</Button>
<Button variant="secondary">See the menu</Button>
<Button variant="callout" iconLeft={<CalendarIcon/>}>RSVP</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

Variants: `primary` (rose, the default CTA), `secondary` (ink outline), `callout` (teal, for events/highlights), `ghost` (transparent tertiary). Sizes `sm | md | lg`. Pass `full` to stretch, `iconLeft`/`iconRight` for icons. Hover darkens fill / inverts the outline; press scales to 0.96.
