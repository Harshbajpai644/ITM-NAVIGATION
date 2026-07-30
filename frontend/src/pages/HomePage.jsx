import { Link } from 'react-router-dom'
import { CAMPUS } from '../utils/geo'

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-label="ITM Campus Navigator hero">
        <div className="hero-map-bg" role="img" aria-label="Campus atmosphere" />
        <div className="hero-content">
          <h1>
            ITM
            <span>Campus Navigator</span>
          </h1>
          <p>
            Live maps, walking routes, and visitor passes for {CAMPUS.name} — find any building and get there on foot.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/navigate">
              Open Live Map
            </Link>
            <Link className="btn btn-ghost" to="/visitor-pass">
              Request Visitor Pass
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>One campus. Clear paths.</h2>
        <p>Everything you need to move around campus without guessing.</p>
        <div className="feature-grid">
          <article className="feature">
            <h3>Live GPS Navigation</h3>
            <p>OpenStreetMap with your current location, destination markers, distance, and walking time.</p>
          </article>
          <article className="feature">
            <h3>Visitor Passes</h3>
            <p>Submit a digital visitor request and track approval from the admin team.</p>
          </article>
          <article className="feature">
            <h3>Building Directory</h3>
            <p>Search academic blocks, hostels, labs, and gates — then navigate in one tap.</p>
          </article>
        </div>
      </section>
    </>
  )
}