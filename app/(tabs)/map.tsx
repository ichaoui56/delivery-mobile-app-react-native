"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface Order {
  id: string
  address: string
  customerName: string
  deliveryTime: string
  latitude: number
  longitude: number
}

const MapScreen = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const markerColors = ["#0f8fd5", "#28a745", "#FFA500", "#E91E63"]
  const getMarkerColor = (index: number) => markerColors[index % markerColors.length]

  const orders: Order[] = [
    {
      id: "1",
      address: "123 Main St, Downtown",
      customerName: "John Doe",
      deliveryTime: "11:00 AM",
      latitude: 40.7128,
      longitude: -74.006,
    },
    {
      id: "2",
      address: "456 Oak Ave, Midtown",
      customerName: "Jane Smith",
      deliveryTime: "11:25 AM",
      latitude: 40.758,
      longitude: -73.9855,
    },
    {
      id: "3",
      address: "789 Pine Rd, Uptown",
      customerName: "Bob Johnson",
      deliveryTime: "11:08 AM",
      latitude: 40.7949,
      longitude: -73.9681,
    },
    {
      id: "4",
      address: "321 Elm St, Suburbs",
      customerName: "Alice Williams",
      deliveryTime: "11:20 AM",
      latitude: 40.6892,
      longitude: -74.0445,
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carte des livraisons</Text>
        <View style={styles.headerSubtitle}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#0f8fd5" />
          <Text style={styles.subtitleText}>{orders.length} commandes actives</Text>
        </View>
      </View>

      {/* Map Container */}
      <LinearGradient colors={["#E3F2FD", "#F5FBFF"]} style={styles.mapContainer}>
        <View style={styles.mapContent}>
          <View style={styles.mapPlaceholder}>
            <MaterialCommunityIcons name="map" size={100} color="#B3D9E8" />
            <Text style={styles.mapText}>Vue carte interactive</Text>
            <Text style={styles.mapSubtext}>Affichage de {orders.length} lieux de livraison</Text>
          </View>

          {/* Map Markers Legend */}
          <View style={styles.markersLegend}>
            {orders.map((order, index) => (
              <View key={order.id} style={styles.legendMarker}>
                <View style={[styles.markerDot, { backgroundColor: getMarkerColor(index) }]}>
                  <Text style={styles.markerNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.markerLabel} numberOfLines={1}>
                  {order.address.split(",")[0]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Orders List */}
      <ScrollView style={styles.ordersContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.ordersTitle}>Commandes à livrer</Text>
        {orders.map((order, index) => (
          <TouchableOpacity
            key={order.id}
            style={[styles.orderCard, selectedOrder === order.id && styles.orderCardSelected]}
            onPress={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
            activeOpacity={0.7}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerBadge, { backgroundColor: getMarkerColor(index) }]}>
                <Text style={styles.markerBadgeText}>{index + 1}</Text>
              </View>
            </View>

            <View style={styles.orderInfo}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                <MaterialCommunityIcons name="map-marker" size={12} color="#0f8fd5" /> {order.address}
              </Text>
              <View style={styles.orderMeta}>
                <Text style={styles.metaText}>
                  <MaterialCommunityIcons name="clock" size={11} color="#666" /> {order.deliveryTime}
                </Text>
                <Text style={styles.metaText}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={11} color="#666" />
                  {order.latitude.toFixed(2)}, {order.longitude.toFixed(2)}
                </Text>
              </View>
            </View>

            <MaterialCommunityIcons
              name={selectedOrder === order.id ? "chevron-up" : "chevron-right"}
              size={24}
              color="#0f8fd5"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
  },
  subtitleText: {
    fontSize: 14,
    color: "#0f8fd5",
    marginLeft: 6,
    fontWeight: "600",
  },
  mapContainer: {
    height: 280,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  mapContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  mapText: {
    marginTop: 12,
    fontSize: 16,
    color: "#5BA3C7",
    fontWeight: "bold",
  },
  mapSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: "#8CB9D6",
    fontWeight: "500",
  },
  markersLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    justifyContent: "center",
  },
  legendMarker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  markerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  markerNumber: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  markerLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    maxWidth: 50,
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  orderCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCardSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#0f8fd5",
  },
  markerContainer: {
    marginRight: 12,
  },
  markerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  markerBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  orderMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },

})

export default MapScreen
