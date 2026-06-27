An events-calendar entry with a rose date chip and optional RSVP.

```jsx
<EventCard month="JUL" day="18" tag="Live music"
  title="Patio Sessions: The Coupes" meta="Fri · 7–10pm · free"
  onRsvp={() => rsvp('coupes')} />
```
Omit `onRsvp` to render a static (non-RSVP) entry. Hover-lifts like a Card.
