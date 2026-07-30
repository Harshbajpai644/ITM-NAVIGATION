import { useState } from 'react'
import { visitorApi } from '../api/client'

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'MBA',
  'Administration',
  'Other',
]

const initial = {
  full_name: '',
  mobile: '',
  email: '',
  department: '',
  purpose: '',
  destination: '',
  visit_time: '',
}

export default function VisitorPassPage() {
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  function onChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(null)
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        visit_time: new Date(form.visit_time).toISOString(),
      }
      const { data } = await visitorApi.create(payload)
      setSuccess(data)
      setForm(initial)
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === 'object' && detail) {
        const first = Object.values(detail).flat()[0]
        setError(first || 'Unable to submit visitor pass.')
      } else {
        setError('Unable to submit visitor pass. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass-panel">
      <h1 className="page-title">Visitor Pass</h1>
      <p className="page-sub">Request campus access. Your pass is stored securely and reviewed by admin staff.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Pass submitted successfully. Reference #{success.id} — status: <strong>{success.status}</strong>.
        </div>
      )}

      <form onSubmit={onSubmit} className="form-grid">
        <div className="field">
          <label htmlFor="full_name">Full Name</label>
          <input id="full_name" name="full_name" value={form.full_name} onChange={onChange} required minLength={2} />
        </div>
        <div className="field">
          <label htmlFor="mobile">Mobile</label>
          <input id="mobile" name="mobile" type="tel" value={form.mobile} onChange={onChange} required pattern="[0-9+\-\s]{10,15}" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="department">Department</label>
          <select id="department" name="department" value={form.department} onChange={onChange} required>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="destination">Destination</label>
          <input id="destination" name="destination" value={form.destination} onChange={onChange} required placeholder="e.g. Main Academic Block" />
        </div>
        <div className="field">
          <label htmlFor="visit_time">Visit Time</label>
          <input id="visit_time" name="visit_time" type="datetime-local" value={form.visit_time} onChange={onChange} required />
        </div>
        <div className="field full">
          <label htmlFor="purpose">Purpose</label>
          <textarea id="purpose" name="purpose" value={form.purpose} onChange={onChange} required placeholder="Reason for visit" />
        </div>
        <div className="field full">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Visitor Pass'}
          </button>
        </div>
      </form>
    </div>
  )
}