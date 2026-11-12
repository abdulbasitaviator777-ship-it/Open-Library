
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type FooterLink = {
  label: string;
  url: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const defaultSections: FooterSection[] = [
  {
    title: "Information",
    links: [
      { label: "Privacy Policy", url: "/privacy-policy" },
      { label: "About Us", url: "/about" },
      { label: "Terms & Conditions", url: "/terms" }
    ]
  },
  {
    title: "New Features",
    links: [
      { label: "Request a Book", url: "/request-a-book" },
      { label: "Publishing", url: "/publishing" }
    ]
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", url: "/contact" },
      { label: "FAQ's", url: "/faq" }
    ]
  }
];

function FooterUrl({ link }: { link: FooterLink }) {
  const external = /^https?:\/\//i.test(link.url);

  if (external) {
    return (
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }

  return <Link href={link.url || "/"}>{link.label}</Link>;
}

export async function SiteFooter() {
  let siteName = "Verdant Archive";
  let logoText = "VA";
  let logoUrl = "";
  let footer = {
    tagline: "A thoughtful home for stories, images and motion.",
    sections: defaultSections,
    contact: { address: "", phone: "", email: "" },
    social: [] as FooterLink[],
    copyright: "All rights reserved."
  };

  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("site_settings")
      .select("site_name, logo_text, logo_url, footer_settings")
      .eq("id", 1)
      .maybeSingle();

    if (data) {
      siteName = data.site_name || siteName;
      logoText = data.logo_text || logoText;
      logoUrl = data.logo_url || "";

      if (data.footer_settings) {
        const saved = data.footer_settings;

        footer = {
          ...footer,
          ...saved,
          contact: {
            ...footer.contact,
            ...(saved.contact || {})
          },
          sections: Array.isArray(saved.sections)
            ? saved.sections
            : defaultSections,
          social: Array.isArray(saved.social)
            ? saved.social
            : []
        };
      }
    }
  } catch {
    // Show default footer if settings cannot be loaded.
  }

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} />
            ) : (
              <span className="footer-logo-mark">{logoText}</span>
            )}
            <strong>{siteName}</strong>
          </Link>

          <p>{footer.tagline}</p>

          {(footer.contact.address ||
            footer.contact.phone ||
            footer.contact.email) && (
            <div className="footer-contact">
              {footer.contact.address && (
                <p>{footer.contact.address}</p>
              )}

              {footer.contact.phone && (
                <p>
                  Call us:{" "}
                  <a href={`tel:${footer.contact.phone}`}>
                    {footer.contact.phone}
                  </a>
                </p>
              )}

              {footer.contact.email && (
                <p>
                  Email:{" "}
                  <a href={`mailto:${footer.contact.email}`}>
                    {footer.contact.email}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="footer-columns">
          {footer.sections.map((section, index) => (
            <div className="footer-column" key={index}>
              <h3>{section.title}</h3>

              <ul>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <FooterUrl link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {siteName}.{" "}
          {footer.copyright}
        </span>

        {footer.social.length > 0 && (
          <div className="footer-social">
            {footer.social
              .filter((item) => item.label && item.url)
              .map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                >
                  {item.label}
                </a>
              ))}
          </div>
        )}
      </div>
    </footer>
  );
}
