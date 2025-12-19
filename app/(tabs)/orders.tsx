"use client"

import { useAuth } from "@/lib/auth-provider"
import { apiAllOrders, type Order, type OrderStatus } from "@/lib/mobile-auth"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

type FilterStatus = "all" | OrderStatus

const OrdersScreen = () => {
  const router = useRouter()
  const { token } = useAuth()

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!token) return
      setLoading(true)
      try {
        const res = await apiAllOrders(token)
        if (mounted) setOrders(res.orders || [])
      } catch {
        if (mounted) setOrders([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [token])

  const filteredOrders = useMemo(() => {
    if (filterStatus === "all") return orders
    return orders.filter((order) => order.status === filterStatus)
  }, [orders, filterStatus])

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "En attente"
      case "ACCEPTED":
        return "Acceptée"
      case "ASSIGNED_TO_DELIVERY":
        return "Assignée"
      case "DELIVERED":
        return "Livrée"
      case "CANCELLED":
        return "Annulée"
      case "REPORTED":
        return "Signalée"
      case "REJECTED":
        return "Rejetée"
      default:
        return status
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "#FFA500"
      case "ACCEPTED":
      case "ASSIGNED_TO_DELIVERY":
        return "#0f8fd5"
      case "DELIVERED":
        return "#28a745"
      case "CANCELLED":
      case "REJECTED":
      case "REPORTED":
        return "#dc3545"
      default:
        return "#666"
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "clock-outline"
      case "ACCEPTED":
      case "ASSIGNED_TO_DELIVERY":
        return "truck-fast"
      case "DELIVERED":
        return "check-circle"
      case "CANCELLED":
        return "close-circle"
      case "REPORTED":
        return "alert-circle"
      case "REJECTED":
        return "close-circle"
      default:
        return "help-circle"
    }
  }

  const OrderCard = ({ order }: { order: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/order-details/${order.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.orderCardContent}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderID}>{`#${order.id}`}</Text>
            <Text style={styles.customerName} numberOfLines={1}>
              {order.merchant?.companyName || order.merchant?.user?.name || ""}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
            <MaterialCommunityIcons name={getStatusIcon(order.status)} size={14} color={getStatusColor(order.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}> 
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.address} numberOfLines={1}>
          <MaterialCommunityIcons name="map-marker" size={12} color="#666" /> {order.city || ""}
        </Text>

        <View style={styles.orderFooter}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>
              <MaterialCommunityIcons name="clock" size={12} color="#666" />
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
            </Text>
            <Text style={styles.detailLabel}>
              <MaterialCommunityIcons name="store" size={12} color="#666" /> {order.orderItems?.length || 0} articles
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  const SkeletonCard = () => (
    <View style={[styles.orderCard, styles.skeletonCard]}>
      <View style={styles.skeletonLineLg} />
      <View style={styles.skeletonLineSm} />
      <View style={styles.skeletonLineMd} />
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Toutes les commandes</Text>
        <Text style={styles.headerSubtitle}>{filteredOrders.length} commandes</Text>
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {([
          "all",
          "PENDING",
          "ACCEPTED",
          "ASSIGNED_TO_DELIVERY",
          "DELIVERED",
          "CANCELLED",
          "REPORTED",
          "REJECTED",
        ] as FilterStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>
              {status === "all" ? "Toutes" : getStatusLabel(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders Grid - 2 per row */}
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.ordersGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonGrid}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Aucune commande</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#0f8fd5",
    fontWeight: "600",
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterContent: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#0f8fd5",
    borderColor: "#0f8fd5",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  ordersGrid: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  skeletonGrid: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  skeletonCard: {
    padding: 12,
    marginHorizontal: 0,
  },
  skeletonLineLg: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "#EDEDED",
    marginBottom: 10,
    width: "70%",
  },
  skeletonLineMd: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EDEDED",
    marginTop: 10,
    width: "55%",
  },
  skeletonLineSm: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EDEDED",
    width: "90%",
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderCard: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666",
    fontWeight: "600",
  },
  orderCardContent: {
    padding: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  orderID: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f8fd5",
    marginBottom: 2,
  },
  customerName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  address: {
    fontSize: 11,
    color: "#666",
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 6,
  },
  detailLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  price: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f8fd5",
  },
})

export default OrdersScreen
