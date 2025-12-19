"use client"

import { useAuth } from "@/lib/auth-provider"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"

const SettingsScreen = () => {
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.replace("/(auth)/signin")
  }

  type SettingsMenu = {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    items: Array<{
      label: string;
      state: boolean;
      setState: (value: boolean) => void;
    }>;
  };

  const settingsMenus: SettingsMenu[] = [
    {
      title: "Notifications",
      icon: "bell",
      items: [{ label: "Push Notifications", state: notificationsEnabled, setState: setNotificationsEnabled }],
    },
    {
      title: "Privacy & Security",
      icon: "lock",
      items: [{ label: "Location Services", state: locationEnabled, setState: setLocationEnabled }],
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Profile Card */}
        <LinearGradient colors={["#0f8fd5", "#0a6ba8"]} style={styles.profileCard}>
          <Image source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }} style={styles.profilePicture} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || ""}</Text>
            <Text style={styles.profileEmail}>{user?.email || ""}</Text>
            {user?.deliveryMan ? (
              <Text style={styles.profileMeta}>
                {user.deliveryMan.city || ""}
                {user.deliveryMan.vehicleType ? ` • ${user.deliveryMan.vehicleType}` : ""}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.editButton}>
            <MaterialCommunityIcons name="pencil" size={16} color="#0f8fd5" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Settings Sections */}
        {settingsMenus.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name={section.icon} size={20} color="#0f8fd5" />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.settingItem}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Switch
                  trackColor={{ false: "#D0D0D0", true: "#B3D9E8" }}
                  thumbColor={item.state ? "#0f8fd5" : "#F0F0F0"}
                  onValueChange={item.setState}
                  value={item.state}
                />
              </View>
            ))}
          </View>
        ))}

        {/* App Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={20} color="#0f8fd5" />
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>About App</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A0A0" />
          </TouchableOpacity>
        </View>

        {/* Support & Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="help-circle" size={20} color="#0f8fd5" />
            <Text style={styles.sectionTitle}>Support</Text>
          </View>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A0A0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#A0A0A0" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={18} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
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
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: "#E3F2FD",
  },
  profileMeta: {
    fontSize: 12,
    color: "#E3F2FD",
    marginTop: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  spacer: {
    height: 20,
  },
})

export default SettingsScreen
