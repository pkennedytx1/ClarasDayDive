/* @ds-bundle: {"format":3,"namespace":"ClaraSDayDiveDesignSystem_09d2bb","components":[{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/display/Eyebrow.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"EventCard","sourcePath":"components/patterns/EventCard.jsx"},{"name":"MenuRow","sourcePath":"components/patterns/MenuRow.jsx"},{"name":"SearchBar","sourcePath":"components/search/SearchBar.jsx"}],"sourceHashes":{"components/display/Badge.jsx":"b3ac856b103a","components/display/Card.jsx":"dcd4f9bac901","components/display/Eyebrow.jsx":"712a331aec0f","components/display/Tag.jsx":"72ae3ccf5d01","components/forms/Button.jsx":"6a9175095dcf","components/forms/IconButton.jsx":"b02058680ce4","components/forms/Input.jsx":"b98e8d78eeb4","components/forms/Select.jsx":"e467d763214a","components/forms/Textarea.jsx":"5eb9fd06e919","components/navigation/NavBar.jsx":"fca846ca715d","components/patterns/EventCard.jsx":"abe694127d20","components/patterns/MenuRow.jsx":"3669edacd9b9","components/search/SearchBar.jsx":"f032ef83d995","ui_kits/website/Contact.jsx":"89a29d8ba3c2","ui_kits/website/Drinks.jsx":"63454d6e7882","ui_kits/website/Events.jsx":"9c065617e9e5","ui_kits/website/Footer.jsx":"2f2a9b1c1c25","ui_kits/website/Hero.jsx":"fcce062677d3","ui_kits/website/WhatsHere.jsx":"7d29eac1cdc9","ui_kits/website/icons.jsx":"a8ee91598281"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ClaraSDayDiveDesignSystem_09d2bb = window.ClaraSDayDiveDesignSystem_09d2bb || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — Badge
 * Small status pill for menu/drink meta: "New", "Seasonal", "Sold out", "21+".
 */
function Badge({
  children,
  tone = 'rose',
  style = {},
  ...rest
}) {
  const tones = {
    rose: {
      bg: 'var(--clr-rose)',
      fg: 'var(--clr-white)'
    },
    teal: {
      bg: 'var(--clr-teal)',
      fg: 'var(--clr-white)'
    },
    sage: {
      bg: 'var(--clr-sage)',
      fg: 'var(--clr-ink)'
    },
    butter: {
      bg: 'var(--clr-butter)',
      fg: 'var(--clr-ink)'
    },
    ink: {
      bg: 'var(--clr-ink)',
      fg: 'var(--clr-cream)'
    },
    outline: {
      bg: 'transparent',
      fg: 'var(--clr-ink)',
      border: '1.5px solid var(--clr-ink)'
    }
  };
  const t = tones[tone] || tones.rose;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      background: t.bg,
      color: t.fg,
      border: t.border || '1.5px solid transparent',
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — Card
 * Paper-white surface with soft warm shadow. Optional hover-lift for clickable cards.
 */
function Card({
  children,
  tone = 'white',
  padding = 'md',
  interactive = false,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    white: {
      background: 'var(--clr-white)',
      color: 'var(--clr-ink)'
    },
    cream: {
      background: 'var(--clr-cream)',
      color: 'var(--clr-ink)'
    },
    rose: {
      background: 'var(--clr-rose)',
      color: 'var(--clr-cream)'
    },
    teal: {
      background: 'var(--clr-teal)',
      color: 'var(--clr-white)'
    },
    ink: {
      background: 'var(--clr-ink)',
      color: 'var(--clr-cream)'
    }
  };
  const pads = {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px'
  };
  const base = {
    borderRadius: 'var(--radius-lg)',
    padding: pads[padding],
    boxShadow: interactive && hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
    transform: interactive && hover ? 'translateY(-3px)' : 'translateY(0)',
    transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
    cursor: interactive ? 'pointer' : 'default',
    ...tones[tone],
    ...style
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: base,
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false)
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — Eyebrow
 * Uppercase tracked overline in sage (default) or teal. Sets section context.
 */
function Eyebrow({
  children,
  color = 'sage',
  as = 'div',
  style = {},
  ...rest
}) {
  const Tag = as;
  const colors = {
    sage: 'var(--clr-sage-deep)',
    teal: 'var(--clr-teal-deep)',
    rose: 'var(--clr-rose)',
    cream: 'var(--clr-cream)'
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-eyebrow)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-eyebrow)',
      color: colors[color] || color,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — Tag
 * Soft filter/category chip (drink families, food trucks). Toggleable `active` state.
 */
function Tag({
  children,
  active = false,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 'var(--radius-pill)',
    cursor: 'pointer',
    border: `1.5px solid ${active ? 'var(--clr-ink)' : 'var(--clr-ink-15)'}`,
    background: active ? 'var(--clr-ink)' : hover ? 'var(--clr-cream-deep)' : 'transparent',
    color: active ? 'var(--clr-cream)' : 'var(--clr-ink)',
    transition: 'all var(--dur-base) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    style: base,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — Button
 * Pill-shaped, poster-confident. Rose primary, ink-outline secondary, teal callout, ghost.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: '14px'
    },
    md: {
      padding: '12px 24px',
      fontSize: '16px'
    },
    lg: {
      padding: '16px 32px',
      fontSize: '18px'
    }
  };
  const variants = {
    primary: {
      background: 'var(--clr-rose)',
      color: 'var(--clr-white)',
      border: '2px solid var(--clr-rose)',
      boxShadow: 'var(--shadow-rose)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--clr-ink)',
      border: '2px solid var(--clr-ink)',
      boxShadow: 'none'
    },
    callout: {
      background: 'var(--clr-teal)',
      color: 'var(--clr-white)',
      border: '2px solid var(--clr-teal)',
      boxShadow: 'none'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--clr-ink)',
      border: '2px solid transparent',
      boxShadow: 'none'
    }
  };
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.01em',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: full ? '100%' : 'auto',
    transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent',
    ...sizes[size],
    ...variants[variant],
    ...style
  };
  const onDown = e => {
    if (!disabled) e.currentTarget.style.transform = 'scale(0.96)';
  };
  const onUp = e => {
    e.currentTarget.style.transform = 'scale(1)';
  };
  const onEnter = e => {
    if (disabled) return;
    if (variant === 'primary') e.currentTarget.style.background = 'var(--clr-rose-deep)';
    if (variant === 'callout') e.currentTarget.style.background = 'var(--clr-teal-deep)';
    if (variant === 'secondary') {
      e.currentTarget.style.background = 'var(--clr-ink)';
      e.currentTarget.style.color = 'var(--clr-cream)';
    }
    if (variant === 'ghost') e.currentTarget.style.background = 'var(--clr-ink-08)';
  };
  const onLeave = e => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.background = variants[variant].background;
    e.currentTarget.style.color = variants[variant].color;
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: base,
    onMouseDown: onDown,
    onMouseUp: onUp,
    onMouseEnter: onEnter,
    onMouseLeave: onLeave
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — IconButton
 * Circular icon-only control for nav, search submit, social, close.
 */
function IconButton({
  children,
  variant = 'solid',
  size = 'md',
  label,
  disabled = false,
  style = {},
  ...rest
}) {
  const dims = {
    sm: 36,
    md: 44,
    lg: 52
  };
  const d = dims[size];
  const variants = {
    solid: {
      background: 'var(--clr-rose)',
      color: 'var(--clr-white)',
      border: '2px solid var(--clr-rose)'
    },
    ink: {
      background: 'var(--clr-ink)',
      color: 'var(--clr-cream)',
      border: '2px solid var(--clr-ink)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--clr-ink)',
      border: '2px solid var(--clr-ink)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--clr-ink)',
      border: '2px solid transparent'
    }
  };
  const base = {
    width: d,
    height: d,
    borderRadius: 'var(--radius-pill)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent',
    ...variants[variant],
    ...style
  };
  const onDown = e => {
    if (!disabled) e.currentTarget.style.transform = 'scale(0.92)';
  };
  const onUp = e => {
    e.currentTarget.style.transform = 'scale(1)';
  };
  const onLeave = e => {
    e.currentTarget.style.transform = 'scale(1)';
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    disabled: disabled,
    style: base,
    onMouseDown: onDown,
    onMouseUp: onUp,
    onMouseLeave: onLeave
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — Input
 * Soft pill/rounded text field on paper-white, ink focus ring in teal.
 */
function Input({
  label,
  hint,
  error,
  type = 'text',
  pill = false,
  iconLeft = null,
  style = {},
  id,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const inputId = id || `inp-${Math.random().toString(36).slice(2, 8)}`;
  const wrap = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--clr-white)',
    border: `1.5px solid ${error ? 'var(--clr-rose)' : focused ? 'var(--clr-teal)' : 'var(--clr-ink-15)'}`,
    borderRadius: pill ? 'var(--radius-pill)' : 'var(--radius-md)',
    padding: pill ? '12px 20px' : '12px 14px',
    boxShadow: focused ? '0 0 0 4px rgba(44,170,160,0.15)' : 'none',
    transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'block',
      marginBottom: '7px',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--clr-ink)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: wrap
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: 'var(--clr-ink-60)'
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      color: 'var(--clr-ink)',
      minWidth: 0
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '6px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: error ? 'var(--clr-rose-deep)' : 'var(--clr-ink-60)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — Select
 * Native select wrapped in the brand field shell with a chevron.
 */
function Select({
  label,
  hint,
  options = [],
  placeholder,
  style = {},
  id,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const inputId = id || `sel-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'block',
      marginBottom: '7px',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--clr-ink)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      background: 'var(--clr-white)',
      border: `1.5px solid ${focused ? 'var(--clr-teal)' : 'var(--clr-ink-15)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focused ? '0 0 0 4px rgba(44,170,160,0.15)' : 'none',
      transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: inputId,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      appearance: 'none',
      WebkitAppearance: 'none',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      padding: '12px 14px',
      paddingRight: '38px',
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      color: 'var(--clr-ink)',
      cursor: 'pointer'
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const value = typeof o === 'string' ? o : o.value;
    const text = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, text);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: '14px',
      pointerEvents: 'none',
      color: 'var(--clr-ink-60)'
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  })))), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '6px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--clr-ink-60)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — Textarea
 * Multi-line field (contact form messages). Matches Input styling.
 */
function Textarea({
  label,
  hint,
  error,
  rows = 4,
  style = {},
  id,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const inputId = id || `ta-${Math.random().toString(36).slice(2, 8)}`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: 'block',
      marginBottom: '7px',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--clr-ink)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: '100%',
      boxSizing: 'border-box',
      resize: 'vertical',
      background: 'var(--clr-white)',
      border: `1.5px solid ${error ? 'var(--clr-rose)' : focused ? 'var(--clr-teal)' : 'var(--clr-ink-15)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      boxShadow: focused ? '0 0 0 4px rgba(44,170,160,0.15)' : 'none',
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      color: 'var(--clr-ink)',
      lineHeight: 1.5,
      outline: 'none',
      transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)'
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '6px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: error ? 'var(--clr-rose-deep)' : 'var(--clr-ink-60)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — NavBar
 * Sticky single-page site nav. Translucent cream on scroll, wordmark left, links + CTA right.
 */
function NavBar({
  logoSrc,
  links = [],
  ctaLabel = 'Reserve',
  onCta,
  scrolled = false,
  style = {},
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: scrolled ? 'rgba(237,229,207,0.86)' : 'transparent',
      backdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--clr-ink-08)' : '1px solid transparent',
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("nav", {
    style: {
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: '14px var(--gutter)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    style: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none'
    }
  }, logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "Clara's Day Dive",
    style: {
      height: 40,
      objectFit: 'contain'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 22,
      color: 'var(--clr-ink)'
    }
  }, "Clara's")), /*#__PURE__*/React.createElement("div", {
    className: "cdd-nav-links",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '28px'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      fontWeight: 600,
      color: 'var(--clr-ink)',
      textDecoration: 'none',
      letterSpacing: '0.01em',
      transition: 'color var(--dur-fast) var(--ease-out)'
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--clr-rose)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--clr-ink)'
  }, l.label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCta,
    style: {
      border: 'none',
      cursor: 'pointer',
      background: 'var(--clr-rose)',
      color: 'var(--clr-white)',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      fontWeight: 600,
      padding: '10px 20px',
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--shadow-rose)',
      transition: 'background var(--dur-base) var(--ease-out)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--clr-rose-deep)',
    onMouseLeave: e => e.currentTarget.style.background = 'var(--clr-rose)'
  }, ctaLabel)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Menu",
    className: "cdd-nav-toggle",
    onClick: () => setOpen(o => !o),
    style: {
      display: 'none',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--clr-ink)',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "7",
    x2: "21",
    y2: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "17",
    x2: "21",
    y2: "17"
  })))), open && /*#__PURE__*/React.createElement("div", {
    className: "cdd-nav-sheet",
    style: {
      padding: '8px var(--gutter) 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      background: 'var(--clr-cream)',
      borderTop: '1px solid var(--clr-ink-08)'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href,
    onClick: () => setOpen(false),
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '17px',
      fontWeight: 600,
      color: 'var(--clr-ink)',
      textDecoration: 'none',
      padding: '12px 0',
      borderBottom: '1px solid var(--clr-ink-08)'
    }
  }, l.label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setOpen(false);
      onCta && onCta();
    },
    style: {
      marginTop: 12,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--clr-rose)',
      color: 'var(--clr-white)',
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      fontWeight: 600,
      padding: '14px',
      borderRadius: 'var(--radius-pill)'
    }
  }, ctaLabel)), /*#__PURE__*/React.createElement("style", null, `
        @media (max-width: 768px) {
          .cdd-nav-links { display: none !important; }
          .cdd-nav-toggle { display: inline-flex !important; }
        }
      `));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/patterns/EventCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — EventCard
 * Calendar entry: date chip + title, time/host meta, and an RSVP affordance.
 */
function EventCard({
  month,
  day,
  title,
  meta,
  tag,
  onRsvp,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      background: 'var(--clr-white)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      transform: hover ? 'translateY(-3px)' : 'translateY(0)',
      transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      width: 64,
      height: 64,
      borderRadius: 'var(--radius-md)',
      background: 'var(--clr-rose)',
      color: 'var(--clr-cream)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.12em'
    }
  }, month), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: '26px',
      lineHeight: 1
    }
  }, day)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, tag && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: 'var(--clr-sage-deep)'
    }
  }, tag), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '2px 0 3px',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: '20px',
      color: 'var(--clr-ink)'
    }
  }, title), meta && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      color: 'var(--clr-ink-60)'
    }
  }, meta)), onRsvp && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onRsvp,
    style: {
      flexShrink: 0,
      border: '2px solid var(--clr-ink)',
      background: 'transparent',
      color: 'var(--clr-ink)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      fontWeight: 600,
      padding: '8px 18px',
      borderRadius: 'var(--radius-pill)',
      transition: 'all var(--dur-base) var(--ease-out)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--clr-ink)';
      e.currentTarget.style.color = 'var(--clr-cream)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--clr-ink)';
    }
  }, "RSVP"));
}
Object.assign(__ds_scope, { EventCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/EventCard.jsx", error: String((e && e.message) || e) }); }

// components/patterns/MenuRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — MenuRow
 * A single drink/menu line: name + leader dots + price, with optional description & badges.
 */
function MenuRow({
  name,
  price,
  description,
  badges = [],
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      padding: '14px 0',
      borderBottom: '1px solid var(--clr-ink-15)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '10px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: '21px',
      color: 'var(--clr-ink)'
    }
  }, name), badges.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: '6px',
      flexShrink: 0
    }
  }, badges.map(b => /*#__PURE__*/React.createElement("span", {
    key: b,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--clr-teal-deep)',
      border: '1.5px solid var(--clr-teal)',
      borderRadius: 'var(--radius-pill)',
      padding: '2px 8px'
    }
  }, b))), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flex: 1,
      borderBottom: '1.5px dotted var(--clr-ink-40)',
      transform: 'translateY(-4px)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: '18px',
      color: 'var(--clr-rose)',
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums'
    }
  }, price)), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      maxWidth: '54ch',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 1.5,
      color: 'var(--clr-ink-60)'
    }
  }, description));
}
Object.assign(__ds_scope, { MenuRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/MenuRow.jsx", error: String((e && e.message) || e) }); }

// components/search/SearchBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Clara's Day Dive — SearchBar (AI "ask Clara")
 * The hero's prominent AI search. Big pill on paper-white with a rose submit button.
 */
function SearchBar({
  placeholder = 'Ask Clara what to drink…',
  buttonLabel = 'Dive in',
  suggestions = [],
  size = 'lg',
  onSubmit,
  style = {},
  ...rest
}) {
  const [value, setValue] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const pad = size === 'lg' ? '10px 10px 10px 22px' : '8px 8px 8px 18px';
  const fs = size === 'lg' ? '18px' : '16px';
  const submit = q => {
    if (onSubmit) onSubmit(q != null ? q : value);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      ...style
    }
  }, /*#__PURE__*/React.createElement("form", _extends({
    onSubmit: e => {
      e.preventDefault();
      submit();
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'var(--clr-white)',
      border: `2px solid ${focused ? 'var(--clr-teal)' : 'var(--clr-ink)'}`,
      borderRadius: 'var(--radius-pill)',
      padding: pad,
      boxShadow: focused ? '0 0 0 5px rgba(44,170,160,0.16)' : 'var(--shadow-md)',
      transition: 'border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)'
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'flex',
      color: 'var(--clr-rose)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2l1.6 4.9a5 5 0 0 0 3.5 3.5L22 12l-4.9 1.6a5 5 0 0 0-3.5 3.5L12 22l-1.6-4.9a5 5 0 0 0-3.5-3.5L2 12l4.9-1.6a5 5 0 0 0 3.5-3.5L12 2z"
  }))), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => setValue(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: fs,
      color: 'var(--clr-ink)',
      minWidth: 0
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: {
      flexShrink: 0,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--clr-rose)',
      color: 'var(--clr-white)',
      fontFamily: 'var(--font-body)',
      fontSize: fs === '18px' ? '16px' : '15px',
      fontWeight: 600,
      padding: size === 'lg' ? '12px 24px' : '10px 18px',
      borderRadius: 'var(--radius-pill)',
      transition: 'background var(--dur-base) var(--ease-out)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--clr-rose-deep)',
    onMouseLeave: e => e.currentTarget.style.background = 'var(--clr-rose)'
  }, buttonLabel)), suggestions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '14px'
    }
  }, suggestions.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    onClick: () => {
      setValue(s);
      submit(s);
    },
    style: {
      background: 'transparent',
      border: '1.5px solid var(--clr-ink-15)',
      borderRadius: 'var(--radius-pill)',
      padding: '7px 14px',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      color: 'var(--clr-ink-80)',
      transition: 'all var(--dur-base) var(--ease-out)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--clr-ink)';
      e.currentTarget.style.color = 'var(--clr-cream)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--clr-ink-80)';
    }
  }, s))));
}
Object.assign(__ds_scope, { SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/search/SearchBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Contact.jsx
try { (() => {
/* global React */
// Contact — event-coordinator form on ink, with the scarf illustration alongside.
function Contact() {
  const {
    Eyebrow,
    Input,
    Textarea,
    Select,
    Button
  } = window.CDD_DS;
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", {
    id: "contact",
    style: {
      background: 'var(--clr-ink)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: 'var(--section-y) var(--gutter)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '48px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "teal"
  }, "Book the bar"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '10px 0 16px',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 'var(--fs-display-lg)',
      letterSpacing: '-0.02em',
      color: 'var(--clr-cream)'
    }
  }, "Plan your party"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 28px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-lg)',
      lineHeight: 1.55,
      color: 'var(--clr-cream)',
      opacity: 0.78,
      maxWidth: '42ch'
    }
  }, "Birthdays, send-offs, slow Sunday socials \u2014 tell us what you're dreaming up and our event coordinator will write back within a day."), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/scarf.jpg",
    alt: "Clara's Day Dive scarf illustration",
    style: {
      width: 'min(280px, 60%)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--clr-cream)',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(24px, 4vw, 40px)',
      boxShadow: 'var(--shadow-lg)'
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '32px 8px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: '32px',
      color: 'var(--clr-rose)'
    }
  }, "Cheers, y'all."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      color: 'var(--clr-ink-80)'
    }
  }, "We've got your note. Clara will be in touch within a day.")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    placeholder: "Clara P.",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    placeholder: "you@email.com",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Event type",
    placeholder: "Choose\u2026",
    options: ['Birthday', 'Corporate', 'Send-off', 'Just because']
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Party size",
    placeholder: "Choose\u2026",
    options: ['Up to 10', '10–25', '25–50', '50+']
  })), /*#__PURE__*/React.createElement(Textarea, {
    label: "Tell us about your event",
    rows: 4,
    placeholder: "Date, vibe, must-haves\u2026"
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    size: "lg",
    full: true
  }, "Send it over")))));
}
window.CDDContact = Contact;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Contact.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Drinks.jsx
try { (() => {
/* global React */
// Drinks menu — filterable with Tag chips, MenuRow list, on paper-white.
function Drinks() {
  const {
    Eyebrow,
    Tag,
    MenuRow,
    Badge
  } = window.CDD_DS;
  const [filter, setFilter] = React.useState('All');
  const drinks = [{
    cat: 'Spritz',
    name: "Clara's Spritz",
    price: '$11',
    badge: 'House',
    desc: 'Aperol, prosecco, a twist of grapefruit oil.'
  }, {
    cat: 'Spritz',
    name: 'Limoncello Fizz',
    price: '$12',
    desc: 'Limoncello, soda, lemon, a little thyme.'
  }, {
    cat: 'Frozen',
    name: 'Frozen Negroni',
    price: '$13',
    badge: 'Seasonal',
    desc: 'Campari, gin, sweet vermouth — slushied.'
  }, {
    cat: 'Frozen',
    name: 'Frosé',
    price: '$12',
    desc: 'Rosé, strawberry, lemon. Dangerously easy.'
  }, {
    cat: 'Classic',
    name: 'Coupe Martini',
    price: '$14',
    desc: 'Gin or vodka, dry, lemon or olive.'
  }, {
    cat: 'Zero-proof',
    name: 'Penguin Punch',
    price: '$9',
    badge: 'No ABV',
    desc: 'Frozen, very pink, all the fun, none of the buzz.'
  }];
  const cats = ['All', 'Spritz', 'Frozen', 'Classic', 'Zero-proof'];
  const shown = filter === 'All' ? drinks : drinks.filter(d => d.cat === filter);
  return /*#__PURE__*/React.createElement("section", {
    id: "drinks",
    style: {
      background: 'var(--clr-white)',
      borderTop: '1px solid var(--clr-ink-08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: 'var(--section-y) var(--gutter)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "rose"
  }, "What's pouring"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '10px 0 24px',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 'var(--fs-display-lg)',
      letterSpacing: '-0.02em',
      color: 'var(--clr-ink)'
    }
  }, "The drinks menu"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      marginBottom: '20px'
    }
  }, cats.map(c => /*#__PURE__*/React.createElement(Tag, {
    key: c,
    active: filter === c,
    onClick: () => setFilter(c)
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '760px'
    }
  }, shown.map(d => /*#__PURE__*/React.createElement(MenuRow, {
    key: d.name,
    name: d.name,
    price: d.price,
    badges: d.badge ? [d.badge] : [],
    description: d.desc
  })))));
}
window.CDDDrinks = Drinks;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Drinks.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Events.jsx
try { (() => {
/* global React */
// Events calendar — EventCard list on a rose feature band.
function Events() {
  const {
    Eyebrow,
    EventCard
  } = window.CDD_DS;
  const [rsvp, setRsvp] = React.useState(null);
  const events = [{
    month: 'JUL',
    day: '18',
    tag: 'Live music',
    title: 'Patio vinyl night',
    time: '7–10pm · Free',
    desc: 'Soul & disco on the turntable, frosé specials all night.'
  }, {
    month: 'JUL',
    day: '24',
    tag: 'Market',
    title: 'Makers & shakers market',
    time: '12–5pm · Free',
    desc: 'Local makers out front, spritz flight inside.'
  }, {
    month: 'AUG',
    day: '02',
    tag: 'Tasting',
    title: 'Low-ABV happy hour',
    time: '4–6pm · $25',
    desc: 'Six sessionable pours, guided by Clara herself.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "events",
    style: {
      background: 'var(--clr-rose)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: 'var(--section-y) var(--gutter)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "cream"
  }, "On the calendar"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '10px 0 28px',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 'var(--fs-display-lg)',
      letterSpacing: '-0.02em',
      color: 'var(--clr-cream)'
    }
  }, "Upcoming events"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px'
    }
  }, events.map(e => /*#__PURE__*/React.createElement(EventCard, {
    key: e.day + e.title,
    month: e.month,
    day: e.day,
    tag: e.tag,
    title: e.title,
    meta: e.time + ' · ' + e.desc,
    onRsvp: () => setRsvp(e.title)
  }))), rsvp && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '20px',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--clr-cream)'
    }
  }, "You're on the list for ", /*#__PURE__*/React.createElement("strong", null, rsvp), " \u2014 see you there.")));
}
window.CDDEvents = Events;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Events.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
/* global React */
// Site footer — wordmark, hours, address, socials.
function Footer() {
  const Icon = window.CDDIcon;
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--clr-cream-deep)',
      borderTop: '1px solid var(--clr-ink-08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: '56px var(--gutter) 40px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '32px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/wordmark-color.png",
    alt: "Clara's Day Dive",
    style: {
      height: 56,
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--clr-ink-60)',
      maxWidth: '28ch'
    }
  }, "Dive in for a day drink. East Austin's coupe bar & patio.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 12px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      color: 'var(--clr-sage-deep)'
    }
  }, "Hours"), ['Mon–Thu · 3pm–12am', 'Fri · 12pm–2am', 'Sat–Sun · 11am–2am'].map(h => /*#__PURE__*/React.createElement("p", {
    key: h,
    style: {
      margin: '0 0 6px',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--clr-ink-80)'
    }
  }, h))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 12px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      color: 'var(--clr-sage-deep)'
    }
  }, "Find us"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 6px',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--clr-ink-80)'
    }
  }, "1814 E Cesar Chavez St"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 14px',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--clr-ink-80)'
    }
  }, "Austin, TX 78702"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    "aria-label": "Instagram",
    style: {
      display: 'inline-flex',
      color: 'var(--clr-ink)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "instagram",
    size: 22
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--clr-ink-08)',
      padding: '18px var(--gutter)',
      textAlign: 'center',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--clr-ink-40)'
    }
  }, "\xA9 2026 Clara's Day Dive \xB7 Please drink responsibly \xB7 21+"));
}
window.CDDFooter = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
/* global React */
// Hero — penguin/coupe symbol + headline + the prominent AI search bar.
function Hero() {
  const {
    SearchBar,
    Eyebrow
  } = window.CDD_DS;
  const [answer, setAnswer] = React.useState(null);
  const reply = q => {
    const map = {
      'Something pink & frozen': "Try the Penguin Punch — frozen, very pink, zero-proof. Or a Frosé if you want the buzz.",
      'Low-ABV spritz': "Clara's Spritz: Aperol, prosecco, a twist of grapefruit. Sessionable all afternoon.",
      "What's on the patio?": "Shade, string lights, dog bowls, and Bird Bird Biscuit til 2. Open till midnight."
    };
    setAnswer(map[q] || "Clara says: come on in — we'll pour you something good.");
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--clr-cream)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: '64px var(--gutter) 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-symbol-color.png",
    alt: "Two penguins diving into a coupe glass",
    style: {
      width: 'min(340px, 70vw)',
      height: 'auto',
      marginBottom: '28px',
      filter: 'drop-shadow(0 14px 30px rgba(28,28,26,0.14))'
    }
  }), /*#__PURE__*/React.createElement(Eyebrow, {
    color: "sage",
    style: {
      marginBottom: '14px'
    }
  }, "East Austin \xB7 Coupe bar & patio"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: 'var(--fs-display-xl)',
      lineHeight: 1.02,
      letterSpacing: '-0.02em',
      color: 'var(--clr-ink)',
      maxWidth: '14ch'
    }
  }, "Dive in for a day drink."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '20px 0 32px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-xl)',
      lineHeight: 1.4,
      color: 'var(--clr-ink-80)',
      maxWidth: '40ch'
    }
  }, "Sun's out, penguins in. A neighborhood coupe bar with cold drinks, good shade, and a rotating cast of food trucks."), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 'min(560px, 100%)'
    }
  }, /*#__PURE__*/React.createElement(SearchBar, {
    placeholder: "Ask Clara what to drink\u2026",
    buttonLabel: "Dive in",
    suggestions: ['Something pink & frozen', 'Low-ABV spritz', "What's on the patio?"],
    onSubmit: reply
  }), answer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '16px',
      background: 'var(--clr-white)',
      border: '1.5px solid var(--clr-ink-15)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 18px',
      textAlign: 'left',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 1.5,
      color: 'var(--clr-ink)',
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--clr-rose)'
    }
  }, "Clara:"), " ", answer))));
}
window.CDDHero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/WhatsHere.jsx
try { (() => {
/* global React */
// What's Here — food trucks / coffee / patio tiles using Card.
function WhatsHere() {
  const {
    Card,
    Eyebrow
  } = window.CDD_DS;
  const Icon = window.CDDIcon;
  const tiles = [{
    icon: 'truck',
    tone: 'cream',
    tag: 'Rotating',
    title: 'Food trucks',
    body: 'Bird Bird Biscuit weekdays, Veracruz tacos on weekends. Always something sizzling out back.'
  }, {
    icon: 'coffee',
    tone: 'white',
    tag: 'Til noon',
    title: 'Morning coffee',
    body: 'Local roast, cold brew on tap, and a flat white that holds up to the heat.'
  }, {
    icon: 'sun',
    tone: 'white',
    tag: 'Open late',
    title: 'The patio',
    body: 'Shaded, dog-friendly, string lights overhead. Open till midnight when the weather plays nice.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "here",
    style: {
      background: 'var(--clr-cream)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: 'var(--section-y) var(--gutter)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "teal"
  }, "More than a bar"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '10px 0 28px',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 'var(--fs-display-lg)',
      letterSpacing: '-0.02em',
      color: 'var(--clr-ink)'
    }
  }, "What's here"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px'
    }
  }, tiles.map(t => /*#__PURE__*/React.createElement(Card, {
    key: t.title,
    tone: t.tone,
    interactive: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '48px',
      height: '48px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--clr-rose)',
      color: 'var(--clr-cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 24
  })), /*#__PURE__*/React.createElement(Eyebrow, {
    color: "sage",
    style: {
      marginBottom: '6px'
    }
  }, t.tag), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px',
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: '26px',
      color: 'var(--clr-ink)'
    }
  }, t.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 1.55,
      color: 'var(--clr-ink-60)'
    }
  }, t.body))))));
}
window.CDDWhatsHere = WhatsHere;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/WhatsHere.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/icons.jsx
try { (() => {
/* global React */
const {
  useState,
  useEffect
} = React;
const DS = window.ClaraSDayDiveDesignSystem_09d2bb;

// Small inline icon set (Lucide-style thin rounded strokes)
function Icon({
  name,
  size = 20,
  stroke = 2
}) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  const paths = {
    menu: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "6",
      x2: "21",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "12",
      x2: "21",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "18",
      x2: "21",
      y2: "18"
    })),
    close: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "6",
      x2: "6",
      y2: "18"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "6",
      x2: "18",
      y2: "18"
    })),
    coffee: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M17 8h1a4 4 0 1 1 0 8h-1"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "2",
      x2: "6",
      y2: "4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "10",
      y1: "2",
      x2: "10",
      y2: "4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "14",
      y1: "2",
      x2: "14",
      y2: "4"
    })),
    truck: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M10 17h4V5H2v12h3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "7.5",
      cy: "17.5",
      r: "2.5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "17.5",
      cy: "17.5",
      r: "2.5"
    })),
    sun: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
    })),
    pin: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
      d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    })),
    clock: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 7 12 12 15 14"
    })),
    instagram: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "2",
      width: "20",
      height: "20",
      rx: "5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "17.5",
      y1: "6.5",
      x2: "17.5",
      y2: "6.5"
    })),
    arrow: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    }))
  };
  return /*#__PURE__*/React.createElement("svg", p, paths[name]);
}
window.CDDIcon = Icon;
window.CDD_DS = DS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.EventCard = __ds_scope.EventCard;

__ds_ns.MenuRow = __ds_scope.MenuRow;

__ds_ns.SearchBar = __ds_scope.SearchBar;

})();
