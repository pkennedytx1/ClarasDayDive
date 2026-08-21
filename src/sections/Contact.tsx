import { Reveal } from '@/components/Reveal';
import { useEventBooking } from '@/context/EventBookingContext';
import { useGeneralContact } from '@/context/GeneralContactContext';
import { getSiteContent } from '@/lib/content';

export function Contact() {
  const site = getSiteContent();
  const { openBooking } = useEventBooking();
  const { openContact } = useGeneralContact();
  const general = site.sections.generalContactCard;
  const event = site.sections.eventContactCard;

  return (
    <section id="contact-us" className="section section--contact" aria-labelledby="contact-heading">
      <div className="container contact-section">
        <Reveal>
          <div className="contact-intro contact-intro--centered">
            <p className="eyebrow eyebrow--cream">{site.sections.contactUs.eyebrow}</p>
            <h2 id="contact-heading" className="display-lg">
              {site.sections.contactUs.title}
            </h2>
            <p className="lead contact-intro__lead">{site.sections.contactUs.lead}</p>
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

        <div className="contact-cards">
          <Reveal delay={80}>
            <article className="contact-card">
              <p className="contact-card__eyebrow">{general.eyebrow}</p>
              <h3 className="contact-card__title">{general.title}</h3>
              <p className="contact-card__pitch">{general.pitch}</p>

              <button type="button" className="btn btn--primary btn--lg btn--full" onClick={openContact}>
                {general.button}
              </button>

              {general.note ? <p className="contact-card__note">{general.note}</p> : null}

              <div className="contact-card__links">
                <a href={`mailto:${site.generalContact.email}`} className="contact-card__link">
                  Or email {site.generalContact.email}
                </a>
              </div>
            </article>
          </Reveal>

          <Reveal delay={160}>
            <article id="contact-event" className="contact-card">
              <p className="contact-card__eyebrow">{event.eyebrow}</p>
              <h3 className="contact-card__title">{event.title}</h3>
              <p className="contact-card__pitch">{event.pitch}</p>

              <button type="button" className="btn btn--primary btn--lg btn--full" onClick={openBooking}>
                {event.button}
              </button>

              <p className="contact-card__note">{site.contact.responseTime}</p>
              {event.note ? <p className="contact-card__note">{event.note}</p> : null}
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
