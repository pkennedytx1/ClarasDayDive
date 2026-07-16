import { Reveal } from '@/components/Reveal';
import { useEventBooking } from '@/context/EventBookingContext';
import { getSiteContent } from '@/lib/content';

export function Contact() {
  const site = getSiteContent();
  const { openBooking } = useEventBooking();

  return (
    <section id="contact" className="section section--contact" aria-labelledby="contact-heading">
      <div className="container contact-grid">
        <Reveal>
          <div className="contact-intro">
            <p className="eyebrow eyebrow--cream">{site.sections.contact.eyebrow}</p>
            <h2 id="contact-heading" className="display-lg">
              {site.sections.contact.title}
            </h2>
            <p className="lead contact-intro__lead">{site.sections.contact.lead}</p>
            <img
              src="/assets/scarf.jpg"
              alt="Vintage scarf illustration with Clara's Day Dive penguin and coupe glass artwork"
              className="contact-scarf"
              width={560}
              height={560}
              loading="lazy"
              decoding="async"
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="contact-card">
            <p className="contact-card__eyebrow">Event inquiry</p>
            <p className="contact-card__pitch">
              Tell us about your party in a short questionnaire — contact info, date, and guest count.
            </p>

            <button type="button" className="btn btn--primary btn--lg btn--full" onClick={openBooking}>
              {site.sections.events.bookingCta}
            </button>

            <p className="contact-card__note">{site.contact.responseTime}</p>

            <div className="contact-card__links">
              <a href={`mailto:${site.contact.email}`} className="contact-card__link">
                {site.contact.email}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
