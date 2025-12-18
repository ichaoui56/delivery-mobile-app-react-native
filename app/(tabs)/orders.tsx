"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

interface Order {
  id: string
  orderId: string
  customerName: string
  address: string
  status: "pending" | "in-progress" | "delivered" | "cancelled"
  totalPrice: number
  deliveryTime: string
  distance: string
}

const OrdersScreen = () => {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const orders: Order[] = [
    {
      id: "1",
      orderId: "ORD001",
      customerName: "John Doe",
      address: "123 Main St, Downtown",
      status: "in-progress",
      totalPrice: 45.99,
      deliveryTime: "15 min",
      distance: "2.5 km",
    },
    {
      id: "2",
      orderId: "ORD002",
      customerName: "Jane Smith",
      address: "456 Oak Ave, Midtown",
      status: "pending",
      totalPrice: 62.5,
      deliveryTime: "25 min",
      distance: "4.2 km",
    },
    {
      id: "3",
      orderId: "ORD003",
      customerName: "Bob Johnson",
      address: "789 Pine Rd, Uptown",
      status: "delivered",
      totalPrice: 38.75,
      deliveryTime: "8 min",
      distance: "1.8 km",
    },
    {
      id: "4",
      orderId: "ORD004",
      customerName: "Alice Williams",
      address: "321 Elm St, Suburbs",
      status: "in-progress",
      totalPrice: 55.2,
      deliveryTime: "20 min",
      distance: "3.6 km",
    },
    {
      id: "5",
      orderId: "ORD005",
      customerName: "Charlie Brown",
      address: "654 Maple Dr, Downtown",
      status: "pending",
      totalPrice: 71.99,
      deliveryTime: "30 min",
      distance: "5.1 km",
    },
    {
      id: "6",
      orderId: "ORD006",
      customerName: "Diana Prince",
      address: "987 Cedar Ln, Uptown",
      status: "cancelled",
      totalPrice: 42.0,
      deliveryTime: "-",
      distance: "2.9 km",
    },
  ]

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((order) => order.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500"
      case "in-progress":
        return "#0f8fd5"
      case "delivered":
        return "#28a745"
      case "cancelled":
        return "#dc3545"
      default:
        return "#666"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "clock-outline"
      case "in-progress":
        return "truck-fast"
      case "delivered":
        return "check-circle"
      case "cancelled":
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
            <Text style={styles.orderID}>{order.orderId}</Text>
            <Text style={styles.customerName} numberOfLines={1}>
              {order.customerName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
            <MaterialCommunityIcons name={getStatusIcon(order.status)} size={14} color={getStatusColor(order.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.address} numberOfLines={1}>
          <MaterialCommunityIcons name="map-marker" size={12} color="#666" /> {order.address}
        </Text>

        <View style={styles.orderFooter}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>
              <MaterialCommunityIcons name="clock" size={12} color="#666" /> {order.deliveryTime}
            </Text>
            <Text style={styles.detailLabel}>
              <MaterialCommunityIcons name="directions" size={12} color="#666" /> {order.distance}
            </Text>
          </View>
          <Text style={styles.price}>${order.totalPrice.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Orders</Text>
        <Text style={styles.headerSubtitle}>{filteredOrders.length} orders</Text>
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {["all", "pending", "in-progress", "delivered", "cancelled"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>
              {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders Grid - 2 per row */}
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.ordersGrid}
        showsVerticalScrollIndicator={false}
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
