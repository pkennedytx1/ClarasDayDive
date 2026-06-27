Brand-styled native select with a chevron — party size, event type, time slots.

```jsx
<Select label="Party size" placeholder="Choose…" options={['2','4','6','8+']} />
<Select label="Event type" options={[{value:'bday',label:'Birthday'},{value:'corp',label:'Corporate'}]} />
```

Options accept plain strings or `{value,label}`. Shares the field shell and teal focus ring.
