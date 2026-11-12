
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FooterLink = {
  label: string;
  url: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

type FooterSettings = {
  tagline: string;
  sections: FooterSection[];
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  social: FooterLink[];
  copyright: string;
};

const defaultFooter: FooterSettings = {
  tagline: "A thoughtful home for stories, images and motion.",
  sections: [
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
  ],
  contact: {
    address: "",
    phone: "",
    email: ""
  },
  social: [
    { label: "Facebook", url: "" },
    { label: "Instagram", url: "" },
    { label: "YouTube", url: "" },
    { label: "Twitter", url: "" }
  ],
  copyright: "All rights reserved."
};

export function SettingsForm() {
  const [siteName, setSiteName] = useState("Verdant Archive");
  const [logoText, setLogoText] = useState("VA");
  const [logoUrl, setLogoUrl] = useState("");
  const [accent, setAccent] = useState("#4f8975");
  const [olive, setOlive] = useState("#89945c");

  const [footer, setFooter] = useState<FooterSettings>(defaultFooter);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        setMessage("Could not load settings: " + error.message);
        return;
      }

      if (data) {
        setSiteName(data.site_name || "Verdant Archive");
        setLogoText(data.logo_text || "VA");
        setLogoUrl(data.logo_url || "");
        setAccent(data.accent_color || "#4f8975");
        setOlive(data.olive_color || "#89945c");

        if (data.footer_settings) {
          setFooter({
            ...defaultFooter,
            ...data.footer_settings,
            contact: {
              ...defaultFooter.contact,
              ...data.footer_settings.contact
            },
            sections: Array.isArray(data.footer_settings.sections)
              ? data.footer_settings.sections
              : defaultFooter.sections,
            social: Array.isArray(data.footer_settings.social)
              ? data.footer_settings.social
              : defaultFooter.social
          });
        }
      }
    }

    loadSettings();
  }, []);

  function updateFooter<K extends keyof FooterSettings>(
    key: K,
    value: FooterSettings[K]
  ) {
    setFooter((current) => ({ ...current, [key]: value }));
  }

  function updateSectionTitle(index: number, title: string) {
    const sections = [...footer.sections];
    sections[index] = { ...sections[index], title };
    updateFooter("sections", sections);
  }

  function updateSectionLinks(index: number, text: string) {
    const sections = [...footer.sections];

    sections[index] = {
      ...sections[index],
      links: text
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [label = "", url = ""] = line.split("|");
          return { label: label.trim(), url: url.trim() };
        })
    };

    updateFooter("sections", sections);
  }

  function addSection() {
    updateFooter("sections", [
      ...footer.sections,
      { title: "New Section", links: [] }
    ]);
  }

  function removeSection(index: number) {
    updateFooter(
      "sections",
      footer.sections.filter((_, i) => i !== index)
    );
  }

  function updateContact(
    key: keyof FooterSettings["contact"],
    value: string
  ) {
    updateFooter("contact", { ...footer.contact, [key]: value });
  }

  function updateSocial(index: number, key: keyof FooterLink, value: string) {
    const social = [...footer.social];
    social[index] = { ...social[index], [key]: value };
    updateFooter("social", social);
  }

  function addSocial() {
    updateFooter("social", [
      ...footer.social,
      { label: "New Social Link", url: "" }
    ]);
  }

  function removeSocial(index: number) {
    updateFooter(
      "social",
      footer.social.filter((_, i) => i !== index)
    );
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.from("site_settings").upsert({
        id: 1,
        site_name: siteName,
        logo_text: logoText,
        logo_url: logoUrl || null,
        accent_color: accent,
        olive_color: olive,
        footer_settings: footer,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setMessage("All website and footer settings saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save settings."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="settings-card" onSubmit={save}>
      <div className="eyebrow">BRAND & APPEARANCE</div>
      <h2 style={{ fontFamily: "Playfair Display", fontSize: 27 }}>
        Make it yours.
      </h2>

      <p style={{ fontSize: 12, color: "#788277" }}>
        Update your website identity and core colours.
      </p>

      <label>
        Website name
        <input
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          required
        />
      </label>

      <label>
        Logo initials / short mark
        <input
          value={logoText}
          onChange={(e) => setLogoText(e.target.value)}
          maxLength={5}
        />
      </label>

      <label>
        Logo image URL
        <input
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </label>

      <label>
        Jade accent colour
        <input
          type="color"
          value={accent}
          onChange={(e) => setAccent(e.target.value)}
        />
      </label>

      <label>
        Olive colour
        <input
          type="color"
          value={olive}
          onChange={(e) => setOlive(e.target.value)}
        />
      </label>

      <hr />

      <div className="eyebrow">FOOTER MANAGEMENT</div>
      <h2>Footer content</h2>

      <label>
        Footer tagline
        <input
          value={footer.tagline}
          onChange={(e) => updateFooter("tagline", e.target.value)}
          placeholder="Your website tagline"
        />
      </label>

      <h3>Footer Sections and Links</h3>

      <p className="settings-help">
        ہر Link ایک نئی لائن میں لکھیں۔ Format:
        Link Name | URL
      </p>

      {footer.sections.map((section, index) => (
        <div className="footer-admin-section" key={index}>
          <label>
            Section heading
            <input
              value={section.title}
              onChange={(e) => updateSectionTitle(index, e.target.value)}
            />
          </label>

          <label>
            Links
            <textarea
              rows={5}
              value={section.links
                .map((link) => `${link.label} | ${link.url}`)
                .join("\n")}
              onChange={(e) => updateSectionLinks(index, e.target.value)}
              placeholder={"Privacy Policy | /privacy-policy"}
            />
          </label>

          <button
            type="button"
            className="button button-danger"
            onClick={() => removeSection(index)}
          >
            Remove Section
          </button>
        </div>
      ))}

      <button
        type="button"
        className="button"
        onClick={addSection}
      >
        + Add Footer Section
      </button>

      <hr />

      <h3>Contact Information</h3>

      <label>
        Address
        <textarea
          rows={2}
          value={footer.contact.address}
          onChange={(e) => updateContact("address", e.target.value)}
          placeholder="Your address"
        />
      </label>

      <label>
        Phone
        <input
          value={footer.contact.phone}
          onChange={(e) => updateContact("phone", e.target.value)}
          placeholder="+92..."
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={footer.contact.email}
          onChange={(e) => updateContact("email", e.target.value)}
          placeholder="info@example.com"
        />
      </label>

      <hr />

      <h3>Social Media Links</h3>

      {footer.social.map((item, index) => (
        <div className="footer-admin-social" key={index}>
          <label>
            Platform
            <input
              value={item.label}
              onChange={(e) =>
                updateSocial(index, "label", e.target.value)
              }
            />
          </label>

          <label>
            Profile URL
            <input
              value={item.url}
              onChange={(e) =>
                updateSocial(index, "url", e.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <button
            type="button"
            className="button button-danger"
            onClick={() => removeSocial(index)}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        className="button"
        onClick={addSocial}
      >
        + Add Social Link
      </button>

      <hr />

      <label>
        Copyright text
        <input
          value={footer.copyright}
          onChange={(e) => updateFooter("copyright", e.target.value)}
        />
      </label>

      <button
        className="button button-jade full"
        disabled={busy}
        type="submit"
      >
        {busy ? "Saving..." : "Save All Settings"}
      </button>

      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
