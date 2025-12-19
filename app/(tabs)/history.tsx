"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

type OrderStatus = "Delivered" | "Cancelled"

const dummyHistory = [
  {
    id: "1",
    orderId: "ORD003",
    customerName: "Bob Johnson",
    deliveryAddress: "789 Pine Ln, Anytown, USA",
    status: "Delivered" as OrderStatus,
    date: "2023-10-26",
    amount: "$45.99",
  },
  {
    id: "2",
    orderId: "ORD004",
    customerName: "Alice Williams",
    deliveryAddress: "101 Maple Dr, Anytown, USA",
    status: "Cancelled" as OrderStatus,
    date: "2023-10-25",
    amount: "$32.50",
  },
  {
    id: "3",
    orderId: "ORD002",
    customerName: "John Smith",
    deliveryAddress: "456 Oak Ave, Anytown, USA",
    status: "Delivered" as OrderStatus,
    date: "2023-10-24",
    amount: "$78.20",
  },
  {
    id: "4",
    orderId: "ORD001",
    customerName: "Sarah Brown",
    deliveryAddress: "123 Elm St, Anytown, USA",
    status: "Delivered" as OrderStatus,
    date: "2023-10-23",
    amount: "$56.75",
  },
]

const HistoryScreen = () => {
  const [filter, setFilter] = useState<OrderStatus>("Delivered")

  const filteredHistory = dummyHistory.filter((order) => order.status === filter)

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return { backgroundColor: "#D4EDDA", color: "#155724" }
      case "Cancelled":
        return { backgroundColor: "#F8D7DA", color: "#721C24" }
      default:
        return { backgroundColor: "#E3F2FD", color: "#0f8fd5" }
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return "check-circle"
      case "Cancelled":
        return "cancel"
      default:
        return "clock"
    }
  }

  const renderHistoryItem = ({ item }: { item: (typeof dummyHistory)[0] }) => (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
      <View style={styles.cardLeft}>
        <View style={[styles.statusIcon, getStatusStyle(item.status)]}>
          <MaterialCommunityIcons
            name={getStatusIcon(item.status)}
            size={20}
            color={getStatusStyle(item.status).color}
          />
        </View>
      </View>
      <View style={styles.cardCenter}>
        <Text style={styles.orderId}>{item.orderId}</Text>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.address} numberOfLines={1}>
          {item.deliveryAddress}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amount}>{item.amount}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique des commandes</Text>
        <Text style={styles.headerSubtitle}>Suivez vos livraisons passées</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <LinearGradient colors={["#0f8fd5", "#0a6ba8"]} style={styles.statCard}>
          <MaterialCommunityIcons name="check-circle" size={32} color="#FFFFFF" />
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Livrées</Text>
        </LinearGradient>
        <LinearGradient colors={["#FF6B6B", "#E53E3E"]} style={styles.statCard}>
          <MaterialCommunityIcons name="cancel" size={32} color="#FFFFFF" />
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Annulées</Text>
        </LinearGradient>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filter === "Delivered" && styles.activeFilterChip]}
          onPress={() => setFilter("Delivered")}
        >
          <MaterialCommunityIcons name="check" size={16} color={filter === "Delivered" ? "#FFFFFF" : "#0f8fd5"} />
          <Text style={[styles.filterChipText, filter === "Delivered" && styles.activeFilterChipText]}>Livrées</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === "Cancelled" && styles.activeFilterChip]}
          onPress={() => setFilter("Cancelled")}
        >
          <MaterialCommunityIcons name="close" size={16} color={filter === "Cancelled" ? "#FFFFFF" : "#FF6B6B"} />
          <Text style={[styles.filterChipText, filter === "Cancelled" && styles.activeFilterChipText]}>Annulées</Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="inbox" size={60} color="#D0D0D0" />
            <Text style={styles.emptyText}>Aucune commande trouvée</Text>
          </View>
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
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#808080",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterChip: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activeFilterChip: {
    backgroundColor: "#0f8fd5",
    borderColor: "#0f8fd5",
  },
  filterChipText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  activeFilterChipText: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: {
    marginRight: 12,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardCenter: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  address: {
    fontSize: 12,
    color: "#808080",
  },
  cardRight: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f8fd5",
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: "#A0A0A0",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#A0A0A0",
    marginTop: 12,
    fontWeight: "500",
  },
})

export default HistoryScreen
