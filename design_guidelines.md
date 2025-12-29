# Financial Security App - Design Guidelines

## Design Approach

**Selected System**: Custom design inspired by Linear's precision and YNAB's financial clarity
**Justification**: This is a utility-focused, data-dense application requiring clarity, trust, and immediate comprehension. Finance apps demand authoritative presentation with zero ambiguity.

**Key Design Principles**:
- **Radical Clarity**: Every number, status, and action must be immediately understandable
- **Hierarchical Authority**: Strict envelopes and critical alerts dominate visually
- **Trustworthy Precision**: Clean lines, ample whitespace, and consistent alignment build confidence
- **Action-Oriented**: Primary actions (pay bill, check advisor, view debt) are always one tap away

---

## Typography

**Font Stack**: Inter (via Google Fonts CDN)
- **Display/Headers**: Inter 700 (Bold) - Financial totals, envelope balances, debt amounts
- **Subheaders**: Inter 600 (Semibold) - Section titles, envelope names, account labels  
- **Body Text**: Inter 400 (Regular) - Descriptions, transaction details, advisor responses
- **Data/Numbers**: Inter 500 (Medium) with tabular numbers enabled - All monetary values, dates, percentages

**Scale**:
- Hero numbers (Safe to Spend): text-5xl to text-6xl
- Section headers: text-2xl
- Envelope/Account names: text-lg
- Body/descriptions: text-base
- Micro labels: text-sm

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 8, 12, 16** (p-2, m-4, gap-8, py-12, space-y-16)

**Grid Structure**:
- Desktop: 3-column dashboard (Envelopes | Main Content | Quick Actions sidebar)
- Tablet: 2-column collapsible layout
- Mobile: Single column stack with sticky header

**Container Strategy**:
- Dashboard max-width: max-w-7xl
- Advisor chat: max-w-4xl centered
- Forms/inputs: max-w-2xl

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Logo/app name (left)
- Primary tabs: Dashboard | Envelopes | Debts | Advisor | Transactions (center)
- User profile + "Safe to Spend" mini-indicator (right)
- Height: h-16, sticky positioning

### Dashboard Components

**Hero Metric Card** (Safe to Spend):
- Large card spanning full width
- Dominant number display with supporting context ("Based on strict envelopes + debt obligations")
- Visual indicator: progress bar showing money allocated vs available
- Quick action: "Ask Advisor About This Purchase" button

**Envelope Grid**:
- Card-based grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Each envelope card displays:
  - Envelope name + strict/flexible badge
  - Current balance (large, bold)
  - Monthly allocation
  - Progress bar (filled vs remaining)
  - Mini-chart showing spend trend
- Strict envelopes have prominent visual treatment (thicker borders, elevated shadow)

**Account Overview Cards**:
- Row of 3 cards: Bills Account | Spending Account | Savings Account
- Each shows current balance + last transaction preview
- Compact, scannable design (h-32 per card)

**Debt Tracker Module**:
- Horizontal cards showing each debt
- Key data: Total owed, interest rate, monthly payment, payoff date estimate
- Bi-weekly payment toggle option displayed prominently
- Progress visualization: debt reduction timeline

### Advisor Chat Interface

**Chat Container**:
- Clean, iMessage-style conversation layout
- User messages: right-aligned, pill-shaped containers
- AI responses: left-aligned with avatar icon
- Input field: sticky bottom, large touch target (h-14), "Ask a question..." placeholder
- Suggested quick questions as chips above input: "Can I afford this?" | "Check budget status" | "Tax write-off eligible?"

### Forms & Inputs

**Standard Input Pattern**:
- Labels above inputs (text-sm, font-medium)
- Input fields: h-12, rounded-lg borders, generous padding (px-4)
- Currency inputs: Right-aligned text, $ prefix visible
- Required fields marked with visual indicator, not just asterisk
- Error states: clear messaging below field

**Buttons**:
- Primary: Large (h-12), full-width on mobile, auto width desktop
- Secondary: Outlined variant, same dimensions
- Danger (delete, override strict): Distinct treatment
- Loading states: Spinner + disabled appearance

### Data Tables

**Transaction Lists**:
- Alternating row treatment for scannability
- Columns: Date | Description | Category | Amount | Account
- Sortable headers
- Inline actions (edit, categorize, mark write-off) on row hover
- Mobile: Card view with stacked data

### Status Indicators

**Visual Language**:
- Strict Envelopes: Badge with distinctive icon (lock symbol)
- Overbudget alerts: Prominent warning banners
- Debt progress: Color-coded progress bars
- Tax write-off eligible: Special tag on transactions
- Payment due: Countdown timer + urgency indicator

---

## Animations

**Minimal, Purposeful**:
- Smooth transitions on card hover (transform scale 1.02, duration-200)
- Gentle fade-in for AI responses (fade-in-up animation)
- Progress bar fills animate on load (duration-1000, ease-out)
- **No**: Excessive micro-interactions, parallax, scroll-jacking

---

## Images

**Dashboard**: No hero images - this is a data-first application
**Marketing/Landing Page** (if built later): 
- Hero: Screenshot of the dashboard showing "Safe to Spend" clarity
- Features section: App screenshots demonstrating strict envelope system
- Testimonial section: User photos (placeholder avatars acceptable)

**In-App Imagery**:
- Empty states: Simple illustrations (e.g., "No debts yet!" with celebratory icon)
- Onboarding: Step-by-step screenshots with annotations
- Advisor avatar: Friendly AI icon or abstract geometric shape

---

## Accessibility

- Maintain WCAG AA contrast ratios for all text
- All interactive elements minimum 44×44px touch targets
- Form inputs have visible focus states (ring-2 treatment)
- Screen reader labels on all icon-only buttons
- Keyboard navigation support throughout dashboard

---

## Mobile Considerations

- Bottom navigation bar for primary tabs on mobile
- Swipeable cards for envelope browsing
- Large, thumb-friendly tap zones
- Collapsible sections to reduce scroll depth
- Quick-add FAB for logging transactions on the go