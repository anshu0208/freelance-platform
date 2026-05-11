import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showError, showLoading, updateToast } from "../utils/toast";

const MyGigs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/gigs/my-gigs");
      const gigsData = res.data.gigs || res.data;
      setGigs(Array.isArray(gigsData) ? gigsData : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load gigs");
      showError("Failed to load gigs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== "seller") { navigate("/"); return; }
    fetchGigs();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gig?")) return;
    const toastId = showLoading("Deleting...");
    setDeletingId(id);
    try {
      await API.delete(`/gigs/${id}`);
      setGigs((prev) => prev.filter((g) => g._id !== id));
      updateToast(toastId, "Deleted");
    } catch (err) {
      updateToast(toastId, "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── LOADING SKELETON ── */
  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="mg-root">
          <div className="mg-inner">
            <div className="mg-skel-header" />
            <div className="mg-list">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mg-skel-card" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="mg-root">
        <div className="mg-inner">

          {/* ── HEADER ── */}
          <div className="mg-header">
            <div>
              <h1 className="mg-title">My Gigs</h1>
              <p className="mg-subtitle">
                Manage your freelance services, update pricing,
                and optimize your gigs for better conversions.
              </p>
            </div>
            <button className="mg-create-btn" onClick={() => navigate("/create-gig")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
              </svg>
              Create New Gig
            </button>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="mg-error">
              <p>{error}</p>
              <button className="mg-create-btn" onClick={fetchGigs}>Retry</button>
            </div>
          )}

          {/* ── EMPTY ── */}
          {!error && gigs.length === 0 && (
            <div className="mg-empty">
              <div className="mg-empty-icon">🚀</div>
              <h2>No gigs yet</h2>
              <p>Start building your freelance presence by creating your first service listing.</p>
              <button className="mg-create-btn" onClick={() => navigate("/create-gig")}>
                Create Your First Gig
              </button>
            </div>
          )}

          {/* ── GIG LIST ── */}
          {!error && gigs.length > 0 && (
            <div className="mg-list">
              {gigs.map((gig, i) => (
                <div
                  key={gig._id}
                  className="mg-card"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* IMAGE */}
                  <div className="mg-img-wrap">
                    <img
                      className="mg-img"
                      src={gig.avatar?.url || gig.avatar || "/placeholder.jpg"}
                      alt={gig.title}
                    />
                    <div className="mg-img-overlay" />
                    <span className="mg-cat-badge">{gig.category}</span>
                  </div>

                  {/* CONTENT */}
                  <div className="mg-content">
                    <div className="mg-top">
                      <div className="mg-title-area">
                        <h2 className="mg-gig-title">{gig.title}</h2>
                        <p className="mg-desc">{gig.description}</p>
                      </div>
                      <div className="mg-price-block">
                        <p className="mg-price-label">Starting at</p>
                        <div className="mg-price-val">
                          <span className="mg-cur">₹</span>
                          {Number(gig.price).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div className="mg-meta">
                      <div>
                        <p className="mg-meta-label">Delivery Time</p>
                        <p className="mg-meta-val">{gig.deliveryTime} Days</p>
                      </div>
                      <div>
                        <p className="mg-meta-label">Status</p>
                        <div className="mg-meta-val mg-active">
                          <span className="mg-dot" /> Active
                        </div>
                      </div>
                    </div>

                    <div className="mg-actions">
                      
                      <div className="mg-btns">
                        <button
                          className="mg-btn mg-btn-edit"
                          onClick={() => navigate(`/edit-gig/${gig._id}`)}
                        >
                          Edit Gig
                        </button>
                        <button
                          className="mg-btn mg-btn-del"
                          disabled={deletingId === gig._id}
                          onClick={() => handleDelete(gig._id)}
                        >
                          {deletingId === gig._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   STYLES — scoped with mg- prefix, no Tailwind
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.mg-root {
  min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif;
  padding: 48px 32px 80px;

  --em: #22c55e;

  --txt: #111827;

  --muted: #6b7280;

  --muted2: #9ca3af;

  --sf: #ffffff;

  --sfh: #fcfcfd;

  --bd: rgba(17,24,39,.06);

  --bdh: rgba(17,24,39,.12);

  --shadow:
    0 10px 30px rgba(17,24,39,.06);

  --shadowHover:
    0 18px 50px rgba(17,24,39,.12);
}

.mg-inner {
  max-width: 1080px;
  margin: 0 auto;
}

/* HEADER */

.mg-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;

  margin-bottom: 52px;

  animation: mgFU .45s ease both;
}

.mg-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--em);

  margin-bottom: 12px;
}

.mg-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(38px, 5vw, 58px);
  line-height: 1;
  letter-spacing: -.03em;
  color: var(--txt);
}

.mg-subtitle {
  margin-top: 14px;

  font-size: 15px;
  line-height: 1.8;

  color: var(--muted);

  max-width: 520px;
}

.mg-create-btn {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 14px 24px;

  border: none;

  border-radius: 999px;

  background: var(--em);

  color: white;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;

  transition:
    transform .18s ease,
    box-shadow .25s ease,
    background .2s ease;

  box-shadow:
    0 10px 25px rgba(34,197,94,.22);
}

.mg-create-btn:hover {
  transform: translateY(-2px);

  background: #16a34a;

  box-shadow:
    0 14px 35px rgba(34,197,94,.3);
}

.mg-create-btn:active {
  transform: scale(.98);
}

/* LIST */

.mg-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* CARD */

.mg-card {
  display: flex;

  background: var(--sf);

  border: 1px solid var(--bd);

  border-radius: 28px;

  overflow: hidden;

  box-shadow: var(--shadow);

  transition:
    transform .35s ease,
    box-shadow .35s ease,
    border-color .35s ease,
    background .35s ease;

  animation: mgFU .5s ease both;
}

.mg-card:hover {
  transform: translateY(-4px);

  box-shadow: var(--shadowHover);

  border-color: var(--bdh);

  background: var(--sfh);
}

.mg-card:hover .mg-img {
  transform: scale(1.05);
}

/* IMAGE */

.mg-img-wrap {
  position: relative;

  width: 320px;
  min-width: 320px;

  overflow: hidden;

  background: #f3f4f6;

  flex-shrink: 0;
}

.mg-img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  display: block;

  min-height: 250px;

  transition:
    transform .7s cubic-bezier(.25,.46,.45,.94),
    filter .5s;

  filter: saturate(1.02);
}

.mg-img-overlay {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      180deg,
      rgba(255,255,255,.02) 0%,
      rgba(0,0,0,.08) 100%
    );

  pointer-events: none;
}

.mg-cat-badge {
  position: absolute;

  top: 18px;
  left: 18px;

  padding: 6px 14px;

  border-radius: 999px;

  background: rgba(255,255,255,.92);

  backdrop-filter: blur(12px);

  border: 1px solid rgba(17,24,39,.08);

  font-size: 11px;
  font-weight: 700;

  letter-spacing: .08em;

  text-transform: uppercase;

  color: #111827;

  box-shadow:
    0 6px 18px rgba(17,24,39,.08);
}

/* CONTENT */

.mg-content {
  flex: 1;

  padding: 34px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  min-width: 0;
}

.mg-top {
  display: flex;
  justify-content: space-between;
  gap: 28px;
  align-items: flex-start;
}

.mg-title-area {
  flex: 1;
  min-width: 0;
}

.mg-gig-title {
  font-family: 'DM Serif Display', serif;

  font-size: 34px;

  line-height: 1.1;

  color: var(--txt);

  letter-spacing: -.02em;

  margin-bottom: 12px;

  text-transform: capitalize;
}

.mg-desc {
  font-size: 15px;

  color: var(--muted);

  line-height: 1.85;

  max-width: 580px;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  overflow: hidden;
}

/* PRICE */

.mg-price-block {
  text-align: right;

  flex-shrink: 0;
}

.mg-price-label {
  font-size: 10px;

  letter-spacing: .18em;

  text-transform: uppercase;

  color: var(--muted2);

  margin-bottom: 8px;
}

.mg-price-val {
  font-family: 'DM Serif Display', serif;

  font-size: 48px;

  line-height: 1;

  color: var(--em);

  white-space: nowrap;
}

.mg-cur {
  font-size: 22px;

  vertical-align: super;

  margin-right: 2px;
}

/* META */

.mg-meta {
  display: flex;

  gap: 42px;

  margin-top: 28px;

  padding-top: 22px;

  border-top: 1px solid var(--bd);
}

.mg-meta-label {
  font-size: 10px;

  letter-spacing: .16em;

  text-transform: uppercase;

  color: var(--muted2);

  margin-bottom: 8px;
}

.mg-meta-val {
  font-size: 15px;

  font-weight: 600;

  color: var(--txt);

  display: flex;
  align-items: center;
  gap: 8px;
}

.mg-active {
  color: var(--em);
}

.mg-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: var(--em);

  box-shadow:
    0 0 10px rgba(34,197,94,.4);
}

/* ACTIONS */

.mg-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 28px;

  padding-top: 24px;

  border-top: 1px solid var(--bd);

  gap: 14px;

  flex-wrap: wrap;
}

.mg-view-link {
  display: flex;
  align-items: center;
  gap: 6px;

  border: none;
  background: none;

  padding: 0;

  cursor: pointer;

  font-size: 14px;
  font-weight: 600;

  color: var(--muted);

  transition: color .2s ease;
}

.mg-view-link:hover {
  color: var(--txt);
}

.mg-view-link svg {
  transition: transform .2s ease;
}

.mg-view-link:hover svg {
  transform: translateX(4px);
}

.mg-btns {
  display: flex;
  gap: 10px;
}

.mg-btn {
  padding: 11px 20px;

  border-radius: 999px;

  border: 1px solid transparent;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;

  transition:
    background .2s ease,
    border-color .2s ease,
    transform .15s ease;
}

.mg-btn:hover {
  transform: translateY(-1px);
}

.mg-btn-edit {
  background: #f3f4f6;

  border-color: #e5e7eb;

  color: #111827;
}

.mg-btn-edit:hover {
  background: #e5e7eb;
}

.mg-btn-del {
  background: #fef2f2;

  border-color: #fecaca;

  color: #dc2626;
}

.mg-btn-del:hover {
  background: #fee2e2;
}

.mg-btn-del:disabled {
  opacity: .5;
  cursor: not-allowed;
}

/* EMPTY */

.mg-empty {
  background: white;

  border: 1px dashed rgba(17,24,39,.08);

  border-radius: 28px;

  padding: 96px 40px;

  text-align: center;

  display: flex;
  flex-direction: column;
  align-items: center;

  animation: mgFU .5s ease both;
}

.mg-empty-icon {
  width: 74px;
  height: 74px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 22px;

  background:
    rgba(34,197,94,.08);

  border:
    1px solid rgba(34,197,94,.16);

  font-size: 32px;

  margin-bottom: 24px;
}

.mg-empty h2 {
  font-family: 'DM Serif Display', serif;

  font-size: 36px;

  color: var(--txt);

  margin-bottom: 12px;
}

.mg-empty p {
  max-width: 420px;

  font-size: 15px;

  line-height: 1.8;

  color: var(--muted);

  margin-bottom: 30px;
}

/* ERROR */

.mg-error {
  background: #fef2f2;

  border: 1px solid #fecaca;

  border-radius: 22px;

  padding: 48px;

  text-align: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.mg-error p {
  color: #dc2626;

  font-size: 15px;

  font-weight: 500;
}

/* LOADING */

.mg-skel-header,
.mg-skel-card {
  background:
    linear-gradient(
      90deg,
      #f3f4f6 25%,
      #e5e7eb 37%,
      #f3f4f6 63%
    );

  background-size: 400% 100%;

  animation: mgShimmer 1.4s ease infinite;
}

.mg-skel-header {
  height: 110px;

  border-radius: 24px;

  margin-bottom: 42px;
}

.mg-skel-card {
  height: 260px;

  border-radius: 28px;
}

@keyframes mgFU {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes mgShimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}

/* RESPONSIVE */

@media (max-width: 860px) {

  .mg-root {
    padding: 28px 16px 60px;
  }

  .mg-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .mg-card {
    flex-direction: column;
  }

  .mg-img-wrap {
    width: 100%;
    min-width: unset;
    height: 240px;
  }

  .mg-content {
    padding: 24px;
  }

  .mg-top {
    flex-direction: column;
    gap: 18px;
  }

  .mg-price-block {
    text-align: left;
  }

  .mg-gig-title {
    font-size: 28px;
  }

  .mg-price-val {
    font-size: 38px;
  }

  .mg-meta {
    gap: 24px;
    flex-wrap: wrap;
  }

  .mg-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .mg-btns {
    width: 100%;
  }

  .mg-btn {
    flex: 1;
  }
}
`;

export default MyGigs;