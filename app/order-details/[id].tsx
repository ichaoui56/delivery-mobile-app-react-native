"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

interface ReasonModalState {
  visible: boolean
  type: "delay" | "cancel" | null
}

const OrderDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [reasonModal, setReasonModal] = useState<ReasonModalState>({ visible: false, type: null })
  const [reasonText, setReasonText] = useState("")

  const order = {
    id: id,
    orderId: `ORD${id}`,
    customerName: "John Doe",
    deliveryAddress: "123 Main St, Anytown, USA",
    status: "En cours",
    estimatedDelivery: "11:00 AM",
    items: [
      { id: "1", name: "Product A", quantity: 2, price: 10 },
      { id: "2", name: "Product B", quantity: 1, price: 25 },
    ],
    totalPrice: 45,
    instructions: "Laisser à la porte d'entrée.",
    latitude: 40.7128,
    longitude: -74.006,
  }

  const handleOpenReasonModal = (type: "delay" | "cancel") => {
    setReasonModal({ visible: true, type })
    setReasonText("")
  }

  const handleSubmitReason = () => {
    if (reasonText.trim()) {
      const action = reasonModal.type === "delay" ? "RETARDÉE" : "ANNULÉE"
      Alert.alert("Confirmé", `La commande a été marquée comme ${action}.\n\nRaison : ${reasonText}`, [
        { text: "OK", onPress: () => setReasonModal({ visible: false, type: null }) },
      ])
      setReasonText("")
    } else {
      Alert.alert("Veuillez saisir une raison avant d'envoyer.")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la commande</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <LinearGradient colors={["#E3F2FD", "#F0F8FF"]} style={styles.statusCard}>
          <View style={styles.statusContent}>
            <View>
              <Text style={styles.orderId}>{order.orderId}</Text>
              <Text style={styles.statusLabel}>{order.status}</Text>
            </View>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons name="truck-fast" size={28} color="#0f8fd5" />
            </View>
          </View>
          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons name="clock" size={16} color="#0f8fd5" />
            <Text style={styles.deliveryTime}>Livraison estimée : {order.estimatedDelivery}</Text>
          </View>
        </LinearGradient>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations client</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={18} color="#0f8fd5" />
            <Text style={styles.infoText}>{order.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#0f8fd5" />
            <Text style={styles.infoText}>{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Récapitulatif de la commande</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qté : {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>${order.totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instructions de livraison</Text>
          <View style={styles.instructionBox}>
            <MaterialCommunityIcons name="information" size={16} color="#0f8fd5" />
            <Text style={styles.instructionText}>{order.instructions}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.acceptButton]}>
            <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Accepter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.navigateButton]}>
            <MaterialCommunityIcons name="navigation" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Naviguer</Text>
          </TouchableOpacity>
        </View>

        {/* Status Update Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mettre à jour le statut</Text>
          <View style={styles.statusButtonsGrid}>
            <TouchableOpacity style={[styles.statusButton, styles.statusButtonPrimary]}>
              <MaterialCommunityIcons name="package-up" size={18} color="#FFFFFF" />
              <Text style={styles.statusButtonText}>Récupérée</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.statusButton, styles.statusButtonSuccess]}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
              <Text style={styles.statusButtonText}>Livrée</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusButtonsGrid}>
            <TouchableOpacity
              style={[styles.statusButton, styles.statusButtonWarning]}
              onPress={() => handleOpenReasonModal("delay")}
            >
              <MaterialCommunityIcons name="clock-alert" size={18} color="#FFFFFF" />
              <Text style={styles.statusButtonText}>Retard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, styles.statusButtonDanger]}
              onPress={() => handleOpenReasonModal("cancel")}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#FFFFFF" />
              <Text style={styles.statusButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Reason Modal */}
      <Modal visible={reasonModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {reasonModal.type === "delay" ? "Raison du retard" : "Raison de l'annulation"}
              </Text>
              <TouchableOpacity onPress={() => setReasonModal({ visible: false, type: null })}>
                <MaterialCommunityIcons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Veuillez indiquer une raison :</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Saisissez votre raison ici..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={reasonText}
                onChangeText={setReasonText}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setReasonModal({ visible: false, type: null })}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSubmit} onPress={handleSubmitReason}>
                <Text style={styles.modalButtonTextSubmit}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f8fd5",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f8fd5",
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliveryTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f8fd5",
  },
  card: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f8fd5",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#1A1A1A",
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f8fd5",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f8fd5",
  },
  instructionBox: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  instructionText: {
    fontSize: 13,
    color: "#1A1A1A",
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: "#28a745",
  },
  navigateButton: {
    backgroundColor: "#0f8fd5",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusButtonsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statusButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  statusButtonPrimary: {
    backgroundColor: "#0f8fd5",
  },
  statusButtonSuccess: {
    backgroundColor: "#28a745",
  },
  statusButtonWarning: {
    backgroundColor: "#FFA500",
  },
  statusButtonDanger: {
    backgroundColor: "#dc3545",
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1A1A1A",
    backgroundColor: "#F9F9F9",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  modalButtonTextCancel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  modalButtonSubmit: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0f8fd5",
    alignItems: "center",
  },
  modalButtonTextSubmit: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
})

export default OrderDetailsScreen
