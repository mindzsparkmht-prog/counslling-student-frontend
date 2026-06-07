import { useState, useEffect } from 'react'
import { IconBrandWhatsapp, IconCheck, IconX, IconClock, IconFileText, IconPhone } from '@tabler/icons-react'
import { Badge } from '../../components/shared/Badge'
import { Card } from '../../components/shared/Card'
import { CardSkeleton } from '../../components/shared/Skeleton'
import api from '../../lib/api'

const statusIcon = {
  Pending: <IconClock size={16} className="text-amber-500" />,
  Submitted: <IconFileText size={16} className="text-blue-500" />,
  Verified: <IconCheck size={16} className="text-green-500" />,
  Rejected: <IconX size={16} className="text-red-500" />,
}

function buildWaUrl(phone, docLabel, studentName, memberId) {
  const digits = phone?.replace(/\D/g, '').replace(/^0/, '') || ''
  const number = digits.length === 10 ? `91${digits}` : digits
  const text = encodeURIComponent(
    `Hello, I am ${studentName} (ID: ${memberId}). I would like to submit my *${docLabel}* for verification. Please guide me.`
  )
  return `https://wa.me/${number}?text=${text}`
}

export default function StudentDocuments() {
  const [docs, setDocs] = useState([])
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocs()
  }, [])

  async function loadDocs() {
    try {
      const studRes = await api.get('/api/students')
      const me = studRes.data[0]
      setStudent(me)
      if (me) {
        const docsRes = await api.get(`/api/documents/student/${me.id}`)
        setDocs(docsRes.data)
      }
    } catch (err) {
      console.error('Failed to load documents', err)
    } finally {
      setLoading(false)
    }
  }

  const done = docs.filter(d => d.status === 'Verified').length
  const submitted = docs.filter(d => d.status === 'Submitted').length
  const rejected = docs.filter(d => d.status === 'Rejected').length
  const total = docs.length

  const counselor = student?.counselor
  const counselorPhone = counselor?.phone
  const hasCounselor = !!counselorPhone

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )

  return (
    <div className="space-y-4 pb-4">
      {/* Stats */}
      <Card>
        <div className="grid grid-cols-3 gap-3 text-center mb-3">
          <div><p className="text-xl font-bold text-green-600">{done}</p><p className="text-xs text-gray-500">Verified</p></div>
          <div><p className="text-xl font-bold text-amber-600">{submitted}</p><p className="text-xs text-gray-500">Submitted</p></div>
          <div><p className="text-xl font-bold text-red-500">{rejected}</p><p className="text-xs text-gray-500">Rejected</p></div>
        </div>
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div className="bg-[#ff6b35] h-full rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">{done}/{total} verified</p>
      </Card>

      {/* WhatsApp verification info banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
        <IconBrandWhatsapp size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">WhatsApp Verification</p>
          <p className="text-xs text-green-700 mt-0.5">
            Send your documents to your counselor on WhatsApp. Tap the WhatsApp button next to each document to share it directly.
          </p>
        </div>
      </div>

      {/* Counselor contact info if no counselor assigned */}
      {!hasCounselor && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
          <IconPhone size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            No counselor assigned yet. You will be able to send documents once a counselor is assigned to you.
          </p>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-2">
        {docs.map(doc => {
          const waUrl = hasCounselor
            ? buildWaUrl(counselorPhone, doc.label, student?.user?.name, student?.member_id)
            : null

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-xl border p-4 ${doc.status === 'Rejected' ? 'border-red-200' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  doc.status === 'Verified' ? 'bg-green-100'
                  : doc.status === 'Submitted' ? 'bg-blue-100'
                  : doc.status === 'Rejected' ? 'bg-red-100'
                  : 'bg-gray-100'
                }`}>
                  {statusIcon[doc.status]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#1a1f36] text-sm">{doc.label}</p>
                    <Badge label={doc.status} />
                  </div>
                  {doc.status === 'Rejected' && doc.remarks && (
                    <p className="text-xs text-red-500 mt-1">Remark: {doc.remarks}</p>
                  )}
                  {doc.status === 'Verified' && (
                    <p className="text-xs text-green-500 mt-1">Verified by counselor ✓</p>
                  )}
                </div>
                {doc.status !== 'Verified' && waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors flex-shrink-0"
                  >
                    <IconBrandWhatsapp size={13} />
                    Send
                  </a>
                )}
                {doc.status !== 'Verified' && !waUrl && (
                  <span className="text-xs text-gray-400 px-2 py-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                    Awaiting counselor
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
