
import {
  approveUpload,
  rejectUpload
} from "@/app/admin/actions";

type ModerationItem = {
  id: string;
  title: string;
  description: string | null;
  kind: "book" | "photo" | "video";
  created_at: string;
  user_id: string;
  signedUrl: string | null;
};

export function ModerationPanel({
  items
}: {
  items: ModerationItem[];
}) {
  return (
    <section className="moderation-section">
      <div className="page-heading">
        <div className="eyebrow">CONTENT MODERATION</div>
        <h2>Pending uploads.</h2>
        <p>
          Review user submissions before making them available
          in the public archive.
        </p>
      </div>

      <div className="moderation-count">
        {items.length} upload(s) waiting for review
      </div>

      {items.length === 0 ? (
        <div className="notice">
          No pending uploads. Your archive is up to date.
        </div>
      ) : (
        <div className="moderation-grid">
          {items.map((item) => (
            <article className="moderation-card" key={item.id}>
              <div className="moderation-preview">
                {!item.signedUrl ? (
                  <p>Preview unavailable</p>
                ) : item.kind === "photo" ? (
                  <img
                    src={item.signedUrl}
                    alt={item.title}
                  />
                ) : item.kind === "video" ? (
                  <video
                    src={item.signedUrl}
                    controls
                    preload="metadata"
                  />
                ) : (
                  <iframe
                    src={item.signedUrl}
                    title={item.title}
                  />
                )}
              </div>

              <div className="moderation-details">
                <div className="eyebrow">
                  {item.kind.toUpperCase()}
                </div>

                <h3>{item.title}</h3>

                {item.description && (
                  <p>{item.description}</p>
                )}

                <p className="moderation-meta">
                  Submitted:{" "}
                  {new Date(item.created_at).toLocaleString()}
                </p>

                <p className="moderation-meta">
                  User ID: {item.user_id}
                </p>

                {item.signedUrl && (
                  <a
                    href={item.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open original file
                  </a>
                )}

                <div className="moderation-actions">
                  <form action={approveUpload}>
                    <input
                      type="hidden"
                      name="id"
                      value={item.id}
                    />
                    <button
                      type="submit"
                      className="button button-jade"
                    >
                      Approve
                    </button>
                  </form>

                  <form action={rejectUpload}>
                    <input
                      type="hidden"
                      name="id"
                      value={item.id}
                    />
                    <button
                      type="submit"
                      className="button button-danger"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
