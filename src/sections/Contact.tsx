import { Reveal } from '@/components/Reveal';
import { getSiteContent } from '@/lib/content';

export function Contact() {
  const { contact } = getSiteContent();
  const mailto = `mailto:${contact.email}?subject=Event%20inquiry%20at%20Clara's%20Day%20Dive`;
  const tel = `tel:${contact.phone.replace(/\D/g, '')}`;

  return (
    <section id="contact" className="section section--contact" aria-labelledby="contact-heading">
      <div className="container contact-grid">
        <Reveal>
          <div className="contact-intro">
            <p className="eyebrow eyebrow--teal">Book the bar</p>
            <h2 id="contact-heading" className="display-lg">
              Plan your event
            </h2>
            <p className="lead contact-intro__lead">
              Birthdays, send-offs, slow Sunday socials — drop us a line and we'll get back to you.
            </p>
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
            <p className="contact-card__role">{contact.coordinatorRole}</p>
            <h3 className="contact-card__name">{contact.coordinatorName}</h3>
            <p className="body-muted" style={{ marginBottom: '1.5rem' }}>
              {contact.responseTime}
            </p>

            <div className="contact-card__links">
              <a href={mailto} className="contact-card__link">
                {contact.email}
              </a>
              <a href={tel} className="contact-card__link">
                {contact.phone}
              </a>
            </div>

            <a href={mailto} className="btn btn--primary btn--lg btn--full">
              Reach out
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
