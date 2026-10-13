# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The product, the **Dipai Digital Fleet Platform**, serves vessel crews and onshore teams at shipowners and operators. It gives both groups a shared view of operations, fuel efficiency, emissions and machinery condition. Confirmed fleet segments: offshore vessels, cruise ships, wellboats and bulk carriers.

The website has two primary audiences, weighted equally (confirmed):

- **Onshore technical evaluators:** technical and fleet managers, superintendents, and energy or ESG managers who assess the platform and champion it internally.
- **Executives and owners:** CEOs, COOs and owners who decide on budget and fleet-wide adoption.

Pages must work for both: technical depth where evaluators look for it, and clear outcomes and proof for decision-makers.

## Product Purpose

Dipai turns vessel data into practical decisions on fuel, emissions and maintenance. It connects data from many sources, explains each operation in context, finds the root causes of inefficiency, and gives practical recommendations. It also covers the regulatory reporting that depends on the same data. Success means lower fuel use and emissions, maintenance planned on condition instead of on the calendar, and less manual reporting work.

The website exists to explain this to both audiences and to turn interest into a **demo request** (primary action) or a **contact enquiry**.

## Positioning

All four points are confirmed as core:

1. **Independent of service suppliers and integrators.** Dipai is not tied to an engine maker or equipment vendor, so it can be deployed across a whole fleet with mixed equipment.
2. **AI combined with maritime domain knowledge.** Dipai grew out of PhD research at NTNU in Ålesund, one of Norway's leading maritime hubs, and was founded in 2021.
3. **Works without sensors.** Report-based vessels get value from noon reports, AIS and weather data. Sensor integration unlocks more detailed analysis and further modules.
4. **End-to-end compliance on the same data.** One pipeline runs from vessel data to EU/UK MRV log abstracts and IMO DCS reports, with automatic corrections and an audit trail. It also covers EU ETS monitoring and allowance estimates, and turns the SEEMP into a measurable target plan.

## Operating Context

- **Data sources:** onboard sensors (engines, thrusters, auxiliaries, navigation), AIS (manual and high-frequency), noon and voyage reports, weather, and fuel, cargo, crew and bunker reports. Reporting integrations such as UniSea avoid crews entering the same information twice.
- **Connection:** through an existing data-collection provider's API, or Dipai's data-collection software on the vessel's onboard server.
- **Users' rhythm:** crews onboard and onshore teams work from one shared picture. Onshore teams follow up targets, operating modes and vessels that need attention.
- **Regulation:** EU MRV, UK MRV, IMO DCS, EU ETS, CII and SEEMP. Dipai can also handle verification with the verifier (optional), and is a DNV Veracity partner.

## Capabilities and Constraints

Modules, as presented on the products page: Fleet overview; VesselGPT (ask questions of vessel data); vessel status; Operations (operational-mode analysis against dynamic baselines); Consumption (fuel); Emissions (CII, EU MRV and IMO DCS, EU ETS); SEEMP; Condition-based maintenance (load profiles, engine performance tests, anomaly detection); Hydrodynamic and maintenance effect tracking; signal history; and data access and export. The platform is modular: customers can start with one module and expand.

Constraints:

- **Website hosting:** a static Astro site on Netlify, with Netlify Forms (contact, demo) and Netlify Web Analytics only. No tracking cookies, no advertising tools, and no other analytics unless newly requested.
- **Theme:** dark is the only theme visitors see. Light mode exists in code but is hidden (`themeSwitching` in `src/data/site-config.js`) until it is ready.
- **Planned features:** EU ETS features appear in the 2026 development plan. Describe them carefully and do not imply capabilities beyond what is confirmed.
- **Domain:** `dipai.no` is the primary domain. `dipai.io` and `dipai.ai` are owned. `portal.dipai.no` is the product login and is separate from this site.

## Brand Commitments

- **Identity:** company name Dipai AS, product name Dipai Digital Fleet Platform, existing Dipai logo assets.
- **Voice:** plain, practical and specific. Concrete operational language over hype. Short headlines with a claim and a payoff (for example "See the signs. Plan with confidence.").
- **Spelling:** British English (colour, optimise).

## Evidence on Hand

Confirmed and safe to publish:

- **Fleet size:** the platform supports **250+ vessels** worldwide.
- **Customers and partners** (logos in `src/data/clients.json`): DOF, Sølvtrans, Solstad Offshore, VARD, Bower, Østensjø Rederi, North Sea Shipping, Island Offshore, and Innovation Norway.
- **DNV Veracity partner.**
- **MRV track record:** EU/UK MRV delivered to the wellboat segment since 2023, and for **60 offshore vessels** for 2025.
- **Testimonials** (`src/data/testimonials.json`): Tom-Erik Jensen (DOF), Svein Erik Isaksen (Solstad), Stian S. Waage (Østensjø Rederi), Sveinung Økland (North Sea Shipping), Torbjørn Ingeborgvik (Island Offshore).
- **Content:** use cases (`src/data/use-cases.json`), news (`src/data/news.json`), team (`src/data/team.json`), FAQs (`src/data/faqs.json`).
- **Reference deck:** MRV, ETS, SEEMP and CBM material in the deck the user supplied.

Must not be fabricated:

- **Chart values:** the figures in the platform charts are illustrative examples adapted from portal views, not customer results. Present them that way.
- **No invented claims:** no invented testimonials, customers, savings figures, benchmarks, certifications, pricing or deployment claims.

## Product Principles

1. **Start from the data a fleet already has.** Value should never depend on a sensor installation, and deeper insight comes as data improves.
2. **One shared truth for ship and shore.** The same data supports crew practice, onshore follow-up and regulatory reporting.
3. **Context before numbers.** Explain each measurement against the operation, mode and baseline it belongs to.
4. **Practical recommendations over dashboards.** Every insight should point to a decision or an action.
5. **Independence and trust.** Stay vendor-neutral, keep an auditable trail, and make only claims the evidence supports.

## Accessibility & Inclusion

The site is tested against automated accessibility checks (axe) in both themes and on desktop and mobile. Moving content respects reduced-motion preferences and has pause controls. Keep keyboard and screen-reader support at this level.
