Sticky single-page site nav. Transparent over the hero, translucent cream blur once scrolled.

```jsx
<NavBar
  logoSrc="assets/wordmark-color.png"
  scrolled={scrolled}
  links={[{label:'Drinks',href:'#drinks'},{label:'Events',href:'#events'}]}
  ctaLabel="Reserve"
  onCta={() => openForm()}
/>
```
Wordmark left; links + rose CTA right; hamburger sheet under 768px. Drive `scrolled` from a scroll listener.
