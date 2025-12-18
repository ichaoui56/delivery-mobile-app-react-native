"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, TextInput } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Path, Polyline, Line } from "react-native-svg"

// --- SVG Icons ---
const BellIcon = ({ size = 24, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
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
type ShipmentStatus = "All" | "Pending" | "On Delivery" | "Delivered"

interface Shipment {
  id: string
  name: string
  trackingId: string
  status: ShipmentStatus
}

// --- Mock Data ---
const mockShipments: Shipment[] = [
  { id: "1", name: "Apple 2022 MacBook Pro...", trackingId: "V789456AR123", status: "On Delivery" },
  { id: "2", name: "iPhone 14 Pro Max (Purple)", trackingId: "V789456AR124", status: "Pending" },
  { id: "3", name: "Sony WH-1000XM5 Headphones", trackingId: "V789456AR125", status: "Delivered" },
  { id: "4", name: "Samsung 49-Inch Curved Gaming Monitor", trackingId: "V789456AR126", status: "On Delivery" },
]

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

// --- Main Component ---
export default function HomeScreen() {
  const router = useRouter()
  const styles = createStyles()

  const [activeFilter, setActiveFilter] = useState<ShipmentStatus>("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredShipments = mockShipments.filter((shipment) => {
    const matchesFilter = activeFilter === "All" || shipment.status === activeFilter
    const matchesSearch =
      shipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.trackingId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const renderShipmentItem = ({ item }: { item: Shipment }) => (
    <TouchableOpacity style={styles.shipmentItem} onPress={() => router.push(`/order-details/${item.id}`)}>
      <View style={styles.shipmentIconContainer}>
        <BoxIcon />
      </View>
      <View style={styles.shipmentDetails}>
        <Text style={styles.shipmentName}>{item.name}</Text>
        <Text style={styles.shipmentTrackingId}>ID: {item.trackingId}</Text>
      </View>
      <Text style={styles.arrowIcon}>{`>`}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header -- */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Hello Daniel</Text>
            <Text style={styles.location}>Colorado, USA</Text>
          </View>
        </View>
        <TouchableOpacity>
          <BellIcon color={LIGHT_COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <View style={styles.listHeaderContainer}>
            {/* --- Current Shipping Card -- */}
            <Text style={styles.sectionTitle}>Current Shipping</Text>
            <LinearGradient colors={["#0f8fd5", "#0a6ba8"]} style={styles.premiumCard}>
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.premiumTitle}>Premium Box Packing</Text>
                  <Text style={styles.premiumId}>ID: V789456AR123</Text>
                </View>
                <TouchableOpacity style={styles.arrowButton}>
                  <Text style={styles.arrowIconWhite}>{`>`}</Text>
                </TouchableOpacity>
              </View>
              <Image source={require("../../assets/images/box-transparent.png")} style={styles.boxImage} />
            </LinearGradient>

            {/* --- Recent Shipments -- */}
            <View style={styles.recentShipmentHeader}>
              <Text style={styles.sectionTitle}>Recent Shipments</Text>
              <TouchableOpacity>
                <Text style={styles.viewMore}>View More</Text>
              </TouchableOpacity>
            </View>

            {/* --- Search Bar -- */}
            <View style={styles.searchBar}>
              <SearchIcon color={LIGHT_COLORS.icon} />
              <TextInput
                placeholder="Enter receipt number"
                placeholderTextColor={LIGHT_COLORS.icon}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* --- Filters -- */}
            <View style={styles.filterContainer}>
              {(["All", "Pending", "On Delivery", "Delivered"] as ShipmentStatus[]).map((status) => (
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
        data={filteredShipments}
        renderItem={renderShipmentItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
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
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
    },
    greeting: {
      color: LIGHT_COLORS.text,
      fontSize: 18,
      fontWeight: "bold",
    },
    location: {
      color: LIGHT_COLORS.icon,
      fontSize: 14,
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
    },
    shipmentName: {
      color: LIGHT_COLORS.text,
      fontSize: 16,
      fontWeight: "bold",
    },
    shipmentTrackingId: {
      color: LIGHT_COLORS.icon,
      fontSize: 14,
      marginTop: 5,
    },
    arrowIcon: {
      color: LIGHT_COLORS.icon,
      fontSize: 18,
      fontWeight: "bold",
    },
  })
}
