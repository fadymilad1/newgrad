'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FiShoppingCart } from 'react-icons/fi'
import { useToast } from '@/components/ui/ToastProvider'
import { getPharmacyOrders, type Order as LocalOrder } from '@/lib/orders'
import {
  markOwnerPharmacyOrdersSeen,
  listOwnerPharmacyOrders,
  updateOwnerPharmacyOrderStatus,
  type PharmacyOrder,
  type PharmacyOrderStatus,
} from '@/lib/pharmacyOrders'
import {
  getPharmacyInbox,
  type PharmacyInboxMessage,
  updatePharmacyInboxStatus,
} from '@/lib/pharmacyInbox'

type DashboardOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

type DashboardOrder = {
  id: string
  apiId?: string
  customerName: string
  customerEmail?: string
  total: number
  status: DashboardOrderStatus
  createdAt: string
  items: string[]
}

const mapApiOrder = (order: PharmacyOrder): DashboardOrder => ({
  id: order.order_number,
  apiId: order.id,
  customerName: order.patient_name,
  customerEmail: order.patient_email,
  total: Number.parseFloat(order.total || '0') || 0,
  status: order.status,
  createdAt: order.created_at,
  items: (order.items || []).map((item) =>
    `${item.product_name}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`,
  ),
})

const mapLocalOrder = (order: LocalOrder): DashboardOrder => ({
  id: order.id,
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  total: order.total,
  status: order.status,
  createdAt: order.createdAt,
  items: order.items,
})

export default function OrdersPage() {
  const { showToast } = useToast()

  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [messages, setMessages] = useState<PharmacyInboxMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<'hospital' | 'pharmacy'>('pharmacy')
  const [markingViewed, setMarkingViewed] = useState(false)

  const knownOrderIdsRef = useRef<Set<string>>(new Set())
  const hasLoadedInitialOrdersRef = useRef(false)

  const isHospital = useMemo(() => userType === 'hospital', [userType])

  const emitUnseenCountUpdate = useCallback((count: number) => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(
      new CustomEvent('pharmacy-unseen-orders-count', {
        detail: { count },
      }),
    )
  }, [])

  const markAllOrdersAsViewed = useCallback(async (silent = false) => {
    if (isHospital) return

    if (!silent) setMarkingViewed(true)

    const response = await markOwnerPharmacyOrdersSeen()
    if (response.error) {
      if (!silent) {
        showToast({ type: 'error', title: 'Could not mark orders viewed', message: response.error })
      }
      if (!silent) setMarkingViewed(false)
      return
    }

    const remaining = Number(response.data?.remaining_unseen || 0)
    emitUnseenCountUpdate(remaining)

    if (!silent) {
      showToast({
        type: 'success',
        title: 'Orders marked as viewed',
        message: remaining > 0 ? `${remaining} unseen orders remain.` : 'No unseen orders left.',
      })
      setMarkingViewed(false)
    }
  }, [emitUnseenCountUpdate, isHospital, showToast])

  const loadOrders = useCallback(async (silent = false) => {
    if (isHospital) {
      setOrders(getPharmacyOrders().map(mapLocalOrder))
      setLoading(false)
      return
    }

    const response = await listOwnerPharmacyOrders()
    if (response.error) {
      if (!silent) {
        showToast({ type: 'error', title: 'Could not load orders', message: response.error })
      }
      setLoading(false)
      return
    }

    const nextOrders = (response.data || []).map(mapApiOrder)

    let shouldMarkSeen = false
    if (hasLoadedInitialOrdersRef.current) {
      const newOrders = nextOrders.filter((order) => !knownOrderIdsRef.current.has(order.id))
      if (newOrders.length > 0) {
        const first = newOrders[0]
        const firstItem = first.items[0] || 'items'
        showToast({
          type: 'info',
          title: 'New order received',
          message: `${first.customerName} placed an order (${firstItem}).`,
        })
        shouldMarkSeen = true
      }
    } else if (nextOrders.length > 0) {
      shouldMarkSeen = true
    }

    knownOrderIdsRef.current = new Set(nextOrders.map((order) => order.id))
    hasLoadedInitialOrdersRef.current = true

    setOrders(nextOrders)
    setMessages(getPharmacyInbox())
    setLoading(false)

    if (shouldMarkSeen) {
      await markAllOrdersAsViewed(true)
    }
  }, [isHospital, markAllOrdersAsViewed, showToast])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserType(user.businessType || user.business_type || 'hospital')
      } catch {
        setUserType('hospital')
      }
    }
  }, [])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    if (isHospital) return

    const intervalId = window.setInterval(() => {
      void loadOrders(true)
    }, 8000)

    return () => window.clearInterval(intervalId)
  }, [isHospital, loadOrders])

  useEffect(() => {
    if (isHospital) return
    void markAllOrdersAsViewed(true)
  }, [isHospital, markAllOrdersAsViewed])

  const updateStatus = async (order: DashboardOrder, status: PharmacyOrderStatus) => {
    if (isHospital || !order.apiId) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
      return
    }

    const response = await updateOwnerPharmacyOrderStatus(order.apiId, status)
    if (response.error) {
      showToast({ type: 'error', title: 'Status update failed', message: response.error })
      return
    }

    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
  }

  const resolveMessage = (messageId: string) => {
    updatePharmacyInboxStatus(messageId, 'resolved')
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, status: 'resolved' } : message,
      ),
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-neutral-gray">
          {isHospital ? 'Loading appointments…' : 'Loading orders…'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden px-0 sm:px-0">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-dark mb-1 sm:mb-2">
              {isHospital ? 'Appointments' : 'Orders'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-gray">
              {isHospital
                ? 'Patient appointments from your hospital website. Manage them here.'
                : 'Customer orders from your pharmacy website. Handle them here.'}
            </p>
          </div>
          {!isHospital && (
            <Button
              type="button"
              variant="secondary"
              className="text-xs sm:text-sm"
              onClick={() => void markAllOrdersAsViewed(false)}
              disabled={markingViewed}
            >
              {markingViewed ? 'Marking...' : 'Mark All Viewed'}
            </Button>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-6 sm:p-8 text-center">
          <FiShoppingCart className="mx-auto mb-3 sm:mb-4 text-neutral-gray" size={40} />
          <p className="text-sm sm:text-base text-neutral-gray">
            {isHospital ? 'No appointments yet.' : 'No orders yet.'}
          </p>
          <p className="text-xs sm:text-sm text-neutral-gray mt-1">
            {isHospital
              ? 'Appointments scheduled through your website will appear here as cards.'
              : 'Orders placed on your website will appear here as cards.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {orders.map((order) => {
            const isPending = order.status === 'pending'
            const isProcessing = order.status === 'processing'
            const isCompleted = order.status === 'completed'
            const isCancelled = order.status === 'cancelled'
            const statusBg = isCompleted
              ? 'bg-green-100 text-green-800'
              : isProcessing
                ? 'bg-blue-100 text-blue-800'
              : isCancelled
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'

            return (
              <Card
                key={order.id}
                className="p-4 sm:p-5 border border-neutral-border hover:shadow-md transition-shadow flex flex-col min-w-0"
              >
                <div className="flex justify-between items-start gap-2 mb-2 sm:mb-3 min-w-0">
                  <span className="font-semibold text-neutral-dark text-sm sm:text-base truncate">
                    {order.id}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 sm:py-1 rounded flex-shrink-0 ${statusBg}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-dark truncate">{order.customerName}</p>
                {order.customerEmail && (
                  <p className="text-xs text-neutral-gray truncate">{order.customerEmail}</p>
                )}
                <p className="text-base sm:text-lg font-bold text-primary mt-1 sm:mt-2">
                  ${order.total.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-gray mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                {order.items && order.items.length > 0 && (
                  <ul className="text-xs text-neutral-dark mt-2 sm:mt-3 list-disc list-inside space-y-0.5 line-clamp-3">
                    {order.items.slice(0, 5).map((item, i) => (
                      <li key={i} className="truncate">
                        {item}
                      </li>
                    ))}
                    {order.items.length > 5 && (
                      <li className="text-neutral-gray">+{order.items.length - 5} more</li>
                    )}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pt-3 border-t border-neutral-border">
                  {isPending && (
                    <>
                      <Button
                        type="button"
                        variant="primary"
                        className="text-xs sm:text-sm py-2 px-3 min-h-[36px] sm:min-h-[40px]"
                        onClick={() => updateStatus(order, 'processing')}
                      >
                        Mark processing
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-xs sm:text-sm py-2 px-3 min-h-[36px] sm:min-h-[40px]"
                        onClick={() => updateStatus(order, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {isProcessing && (
                    <>
                      <Button
                        type="button"
                        variant="primary"
                        className="text-xs sm:text-sm py-2 px-3 min-h-[36px] sm:min-h-[40px]"
                        onClick={() => updateStatus(order, 'completed')}
                      >
                        Mark completed
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-xs sm:text-sm py-2 px-3 min-h-[36px] sm:min-h-[40px]"
                        onClick={() => updateStatus(order, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {!isHospital && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-dark">Customer Messages</h2>
          {messages.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-neutral-gray">No customer messages yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {messages.map((message) => {
                const isResolved = message.status === 'resolved'
                return (
                  <Card key={message.id} className="p-4 sm:p-5 border border-neutral-border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-neutral-gray uppercase tracking-wide">
                        {message.type === 'refill' ? 'Refill Request' : 'Contact'}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          isResolved ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isResolved ? 'Resolved' : 'New'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-dark">{message.name}</p>
                    <p className="text-xs text-neutral-gray mt-1 break-all">{message.contact}</p>
                    <p className="text-sm text-neutral-dark mt-3 line-clamp-4">{message.message}</p>
                    <p className="text-xs text-neutral-gray mt-3">{new Date(message.createdAt).toLocaleString()}</p>
                    {!isResolved && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-3 text-xs sm:text-sm"
                        onClick={() => resolveMessage(message.id)}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
