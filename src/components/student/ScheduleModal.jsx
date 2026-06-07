import { useState } from 'react'
import { IconPhone, IconBrandWhatsapp, IconVideo } from '@tabler/icons-react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input, Textarea } from '../shared/Input'
import api from '../../lib/api'
import { toast } from '../shared/Toast'

const SESSION_TYPES = [
  { value: 'call', label: 'Phone Call', icon: IconPhone, color: 'text-blue-500' },
  { value: 'whatsapp', label: 'WhatsApp', icon: IconBrandWhatsapp, color: 'text-green-500' },
  { value: 'video', label: 'Video Call', icon: IconVideo, color: 'text-purple-500' },
]

export function ScheduleModal({ open, onClose, onBooked }) {
  const [type, setType] = useState('call')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!date || !time) return toast.error('Please select date and time')
    setLoading(true)
    try {
      await api.post('/api/sessions', { type, date, time, note })
      toast.success('Session booked! Awaiting counselor confirmation.')
      onBooked?.()
      onClose()
      setDate('')
      setTime('')
      setNote('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Book a Counseling Session">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
          <div className="grid grid-cols-3 gap-2">
            {SESSION_TYPES.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  type === value ? 'border-[#ff6b35] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon size={22} className={type === value ? 'text-[#ff6b35]' : color} />
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} min={today} required />
        <Input label="Preferred Time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
        <Textarea label="Note (optional)" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Any specific questions or topics to discuss..." />

        <Button type="submit" loading={loading} className="w-full">Confirm Booking</Button>
      </form>
    </Modal>
  )
}
