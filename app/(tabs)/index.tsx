"use client"

import { useAuth } from "@/lib/auth-provider"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native"
import Svg, { Line, Path, Polyline } from "react-native-svg"
import { apiLatestOrders, Order, OrderStatus as ApiOrderStatus, getAuthToken } from "@/lib/mobile-auth"

// --- SVG Icons ---
const BellIcon = ({ size = 24, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
      fill={color}
    />
  </Svg>
)

const RefreshIcon = ({ size = 24, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
      fill={color}
    />
  </Svg>
)

const BoxIcon = ({ size = 24, color = "#0f8fd5" }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <Polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <Line x1="12" y1="22.08" x2="12" y2="12" />
  </Svg>
)

const SearchIcon = ({ size = 20, color = "#A0A0A0" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
      fill={color}
    />
  </Svg>
)

// --- Interfaces ---
type ShipmentStatus = "Tous" | "En attente" | "En cours" | "Livré"

// --- Light Theme Colors ---
const LIGHT_COLORS = {
  background: "#FFFFFF",
  text: "#1A1A1A",
  icon: "#808080",
  card: "#F9F9F9",
  border: "#E0E0E0",
  primary: "#0f8fd5",
  secondary: "#F3F4F6",
}

// Helper function to map API status to display status
const mapApiStatusToDisplayStatus = (status: ApiOrderStatus): ShipmentStatus => {
  switch (status) {
    case 'PENDING':
    case 'ACCEPTED':
      return 'En attente'
    case 'ASSIGNED_TO_DELIVERY':
      return 'En cours'
    case 'DELIVERED':
      return 'Livré'
    default:
      return 'En attente'
  }
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }
}

// Helper function to get product names from order
const getOrderProductNames = (order: Order): string => {
  const productNames = order.orderItems.map(item => item.product.name)
  if (productNames.length === 0) return 'Commande'
  if (productNames.length === 1) return productNames[0]
  return `${productNames[0]} +${productNames.length - 1} autres`
}

// --- Main Component ---
export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const styles = createStyles()

  const [activeFilter, setActiveFilter] = useState<ShipmentStatus>("Tous")
  const [searchQuery, setSearchQuery] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get user's first name or default to "Utilisateur"
  const firstName = user?.name?.split(' ')[0] || 'Utilisateur'
  const userCity = user?.deliveryMan?.city || 'Ville inconnue'
  const userEmail = user?.email || ''

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }
      const response = await apiLatestOrders(token)
      setOrders(response.orders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError(null)
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }
      const response = await apiLatestOrders(token)
      setOrders(response.orders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const displayStatus = mapApiStatusToDisplayStatus(order.status)
    const matchesFilter = activeFilter === "Tous" || displayStatus === activeFilter
    const productNames = getOrderProductNames(order)
    const matchesSearch =
      productNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const renderOrderItem = ({ item }: { item: Order }) => {
    const displayStatus = mapApiStatusToDisplayStatus(item.status)
    const productNames = getOrderProductNames(item)
    
    return (
      <TouchableOpacity style={styles.shipmentItem} onPress={() => router.push(`/order-details/${item.id}`)}>
        <View style={styles.shipmentIconContainer}>
          <BoxIcon />
        </View>
        <View style={styles.shipmentDetails}>
          <Text style={styles.shipmentName} numberOfLines={1}>{productNames}</Text>
          <Text style={styles.shipmentTrackingId}>
            <Text style={styles.boldText}>N°: </Text>
            {item.orderCode}
          </Text>
          <Text style={styles.shipmentAddress} numberOfLines={1}>
            {item.address}, {item.city}
          </Text>
          <Text style={styles.shipmentDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor(displayStatus)}1A` },
        ]}>
          <Text style={[styles.statusText, { color: getStatusColor(displayStatus) }]}>
            {displayStatus}
          </Text>
        </View>
        <Text style={styles.arrowIcon}>{">"}</Text>
      </TouchableOpacity>
    )
  }
  
  const getStatusColor = (status: ShipmentStatus): string => {
    switch (status) {
      case 'En cours':
        return '#0f8fd5';
      case 'En attente':
        return '#FFA500';
      case 'Livré':
        return '#4CAF50';
      default:
        return '#808080';
    }
  }

  const currentShipment = orders.find(o => mapApiStatusToDisplayStatus(o.status) === 'En cours')

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header -- */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {user?.image ? (
            <Image 
              source={{ uri: user.image }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.greeting}>Bonjour, {firstName}</Text>
            <Text style={styles.location}>{userCity}</Text>
            {userEmail ? (
              <Text style={styles.email} numberOfLines={1}>{userEmail}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={handleRefresh} 
            disabled={refreshing}
            style={styles.iconButton}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={LIGHT_COLORS.primary} />
            ) : (
              <RefreshIcon color={LIGHT_COLORS.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity>
            <BellIcon color={LIGHT_COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={LIGHT_COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <View style={styles.listHeaderContainer}>
              {/* --- Current Shipping Card -- */}
              <Text style={styles.sectionTitle}>Livraison en cours</Text>
              {currentShipment ? (
                <LinearGradient colors={["#0f8fd5", "#0a6ba8"]} style={styles.premiumCard}>
                  <View style={styles.cardContent}>
                    <View>
                      <Text style={styles.premiumTitle}>
                        {getOrderProductNames(currentShipment)}
                      </Text>
                      <Text style={styles.premiumId}>
                        N°: {currentShipment.orderCode}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.arrowButton}
                      onPress={() => router.push(`/order-details/${currentShipment.id}`)}
                    >
                      <Text style={styles.arrowIconWhite}>{">"}</Text>
                    </TouchableOpacity>
                  </View>
                  <Image 
                    source={require("../../assets/images/box-transparent.png")} 
                    style={styles.boxImage} 
                    resizeMode="contain"
                  />
                </LinearGradient>
              ) : (
                <View style={styles.noShipmentCard}>
                  <Text style={styles.noShipmentText}>Aucune livraison en cours</Text>
                </View>
              )}

              {/* --- Recent Shipments -- */}
              <View style={styles.recentShipmentHeader}>
                <Text style={styles.sectionTitle}>Livraisons récentes</Text>
                <TouchableOpacity onPress={() => router.push('/history')}>
                  <Text style={styles.viewMore}>Voir plus</Text>
                </TouchableOpacity>
              </View>

              {/* --- Search Bar -- */}
              <View style={styles.searchBar}>
                <SearchIcon color={LIGHT_COLORS.icon} />
                <TextInput
                  placeholder="Rechercher un numéro de suivi"
                  placeholderTextColor={LIGHT_COLORS.icon}
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* --- Filters -- */}
              <View style={styles.filterContainer}>
                {(["Tous", "En attente", "En cours", "Livré"] as ShipmentStatus[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.filterButton, activeFilter === status && styles.activeFilterButton]}
                    onPress={() => setActiveFilter(status)}
                  >
                    <Text style={[styles.filterText, activeFilter === status && styles.activeFilterText]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune livraison trouvée</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

// --- Styles ---
const createStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_COLORS.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
    },
    avatarPlaceholder: {
      backgroundColor: LIGHT_COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    greeting: {
      color: LIGHT_COLORS.text,
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 2,
    },
    location: {
      color: LIGHT_COLORS.icon,
      fontSize: 14,
      marginBottom: 2,
    },
    email: {
      color: LIGHT_COLORS.icon,
      fontSize: 12,
      maxWidth: 200,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    iconButton: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listHeaderContainer: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    sectionTitle: {
      color: LIGHT_COLORS.text,
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
    },
    premiumCard: {
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
      marginBottom: 20,
    },
    cardContent: {
      flex: 1,
    },
    premiumTitle: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "bold",
    },
    premiumId: {
      backgroundColor: "#FFFFFF",
      color: "#0f8fd5",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginTop: 10,
      alignSelf: "flex-start",
      fontWeight: "bold",
      overflow: "hidden",
    },
    arrowButton: {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    arrowIconWhite: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },
    boxImage: {
      width: 120,
      height: 100,
      position: "absolute",
      right: 5,
      bottom: -25,
      opacity: 0.8,
    },
    recentShipmentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    viewMore: {
      color: "#0f8fd5",
      fontSize: 14,
      fontWeight: "600",
    },
    searchBar: {
      flexDirection: "row",
      backgroundColor: LIGHT_COLORS.secondary,
      borderRadius: 15,
      paddingHorizontal: 15,
      alignItems: "center",
      marginTop: 10,
    },
    searchInput: {
      flex: 1,
      color: LIGHT_COLORS.text,
      marginLeft: 10,
      height: 50,
      fontSize: 16,
    },
    filterContainer: {
      flexDirection: "row",
      marginTop: 20,
      marginBottom: 10,
    },
    filterButton: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 10,
      backgroundColor: LIGHT_COLORS.secondary,
    },
    activeFilterButton: {
      backgroundColor: "#0f8fd5",
    },
    filterText: {
      color: LIGHT_COLORS.text,
      fontWeight: "500",
    },
    activeFilterText: {
      color: "#FFFFFF",
      fontWeight: "bold",
    },
    shipmentItem: {
      flexDirection: "row",
      backgroundColor: LIGHT_COLORS.card,
      borderRadius: 15,
      padding: 15,
      alignItems: "center",
      marginBottom: 15,
      marginHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 2,
    },
    shipmentIconContainer: {
      backgroundColor: LIGHT_COLORS.secondary,
      padding: 12,
      borderRadius: 12,
      marginRight: 15,
    },
    shipmentDetails: {
      flex: 1,
      marginRight: 10,
      overflow: 'hidden',
    },
    shipmentName: {
      color: LIGHT_COLORS.text,
      fontSize: 16,
      fontWeight: "bold",
    },
    shipmentTrackingId: {
      color: LIGHT_COLORS.icon,
      fontSize: 13,
      marginTop: 2,
    },
    shipmentAddress: {
      color: LIGHT_COLORS.text,
      fontSize: 12,
      opacity: 0.8,
      marginTop: 2,
    },
    shipmentDate: {
      color: LIGHT_COLORS.primary,
      fontSize: 11,
      marginTop: 3,
      fontWeight: '500',
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginRight: 10,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    boldText: {
      fontWeight: 'bold',
    },
    noShipmentCard: {
      backgroundColor: LIGHT_COLORS.secondary,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
      marginBottom: 20,
    },
    noShipmentText: {
      color: LIGHT_COLORS.icon,
      fontSize: 16,
      textAlign: 'center',
    },
    arrowIcon: {
      color: LIGHT_COLORS.icon,
      fontSize: 18,
      fontWeight: "bold",
    },
    emptyContainer: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      color: LIGHT_COLORS.icon,
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: LIGHT_COLORS.icon,
      fontSize: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      color: '#FF0000',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: LIGHT_COLORS.primary,
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 20,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  })
}