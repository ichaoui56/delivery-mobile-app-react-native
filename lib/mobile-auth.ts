import * as SecureStore from "expo-secure-store"

const TOKEN_KEY = "mobile_jwt"

export type DeliveryMan = {
  id: number
  city: string | null
  vehicleType: string | null
  active: boolean
  baseFee?: number
}

export type DeliveryManUser = {
  id: number
  name: string
  email: string
  image?: string | null
  role: "DELIVERYMAN"
  deliveryMan: DeliveryMan
}

type ApiErrorBody = {
  error?: string
  errors?: Record<string, string[]>
}

function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL
  if (envUrl) return envUrl.replace(/\/$/, "")

  return "https://sonic-delivery.up.railway.app"
}

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY)
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export async function apiSignIn(email: string, password: string): Promise<{ token: string; user: DeliveryManUser }> {
  const res = await fetch(`${getApiBaseUrl()}/api/mobile/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  const body = await readJsonSafe<ApiErrorBody & { token?: string; user?: DeliveryManUser }>(res)

  if (!res.ok) {
    const message = body?.error || "Login failed"
    throw new Error(message)
  }

  if (!body?.token || !body.user) {
    throw new Error("Invalid server response")
  }

  return { token: body.token, user: body.user }
}

export async function apiMe(token: string): Promise<{ user: DeliveryManUser }> {
  const res = await fetch(`${getApiBaseUrl()}/api/mobile/auth/me`, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` },
  })

  const body = await readJsonSafe<ApiErrorBody & { user?: DeliveryManUser }>(res)

  if (!res.ok) {
    const message = body?.error || "Unauthorized"
    throw new Error(message)
  }

  if (!body?.user) {
    throw new Error("Invalid server response")
  }

  return { user: body.user }
}

export async function apiLogout(token: string): Promise<void> {
  await fetch(`${getApiBaseUrl()}/api/mobile/auth/logout`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  }).catch(() => null)
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'ASSIGNED_TO_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REPORTED' | 'REJECTED'
type Product = {
  id: number
  name: string
  image: string | null
  sku: string | null
}

type OrderItem = {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  originalPrice: number
  isFree: boolean
  product: Product
}

type UserInfo = {
  id: number
  name: string
  phone: string
  email?: string
  image?: string | null
}

type Merchant = {
  id: number
  companyName: string
  user: UserInfo
}

type DeliveryManInfo = {
  id: number
  user: UserInfo
}

export interface Order {
  id: number
  orderCode: string
  customerName: string
  customerPhone: string
  address: string
  city: string
  note: string
  totalPrice: number
  paymentMethod: string
  merchantEarning: number
  status: OrderStatus
  merchantId: number
  deliveryManId: number
  discountType: string | null
  discountValue: number | null
  discountDescription: string | null
  originalTotalPrice: number | null
  totalDiscount: number | null
  buyXGetYConfig: any | null
  createdAt: string
  deliveredAt: string | null
  updatedAt: string
  orderItems: OrderItem[]
  merchant: Merchant
  deliveryMan: DeliveryManInfo
}

export type OrdersResponse = {
  orders: Order[]
}

export async function apiLatestOrders(token: string): Promise<OrdersResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/mobile/orders/latest`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  const body = await readJsonSafe<OrdersResponse>(res)

  if (!res.ok) {
    throw new Error('Failed to fetch latest orders')
  }

  if (!body?.orders) {
    throw new Error('Invalid orders response')
  }

  return body
}

export async function apiAllOrders(token: string): Promise<OrdersResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/mobile/orders`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  const body = await readJsonSafe<OrdersResponse>(res)

  if (!res.ok) {
    throw new Error('Failed to fetch all orders')
  }

  if (!body?.orders) {
    throw new Error('Invalid orders response')
  }

  return body
}
