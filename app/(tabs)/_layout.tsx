import { usePathname } from "expo-router"
import { useState } from "react"
import { View } from "react-native"
import { CustomBottomNav, type NavItem } from "./custom-bottom-nav" // Import the type
import HistoryScreen from "./history"
import HomeScreen from "./index"
import MapScreen from "./map"
import OrderScreen from "./orders"
import SettingsScreen from "./settings"
import { Ionicons } from "@expo/vector-icons"

export default function TabsLayout() {
  const [activeTab, setActiveTab] = useState("home")
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { name: "home", label: "Home", icon: "home" as keyof typeof Ionicons.glyphMap },
    { name: "orders", label: "Orders", icon: "list" as keyof typeof Ionicons.glyphMap },
    { name: "map", label: "Map", icon: "map" as keyof typeof Ionicons.glyphMap },
    { name: "history", label: "History", icon: "time" as keyof typeof Ionicons.glyphMap },
    { name: "settings", label: "Settings", icon: "settings" as keyof typeof Ionicons.glyphMap },
  ]

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />
      case "orders":
        return <OrderScreen />
      case "map":
        return <MapScreen />
      case "history":
        return <HistoryScreen />
      case "settings":
        return <SettingsScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <CustomBottomNav activeTab={activeTab} onTabChange={setActiveTab} navItems={navItems} />
    </View>
  )
}