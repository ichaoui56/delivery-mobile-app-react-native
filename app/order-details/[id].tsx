"use client"

import {
  apiAcceptOrder,
  apiOrderDetails,
  apiUpdateOrderStatus,
  getAuthToken,
  Order,
  OrderStatus,
  UpdateOrderStatusRequest,
} from "@/lib/mobile-auth"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

type StatusUpdateModalState = {
  visible: boolean
  selectedStatus: "REPORTED" | "REJECTED" | "CANCELLED" | "DELIVERED" | null
  reason: string
  commonReason: string
}

const COMMON_REASONS = [
  "Customer not available",
  "Refused",
  "Wrong address",
  "Other",
]

const OrderDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [statusModal, setStatusModal] = useState<StatusUpdateModalState>({
    visible: false,
    selectedStatus: null,
    reason: "",
    commonReason: "",
  })
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }
      const orderId = Number.parseInt(Array.isArray(id) ? id[0] : id, 10)
      if (!Number.isFinite(orderId)) {
        throw new Error('Invalid order ID')
      }
      const response = await apiOrderDetails(token, orderId)
      setOrder(response.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details')
      console.error('Error fetching order details:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'En attente',
      'ACCEPTED': 'Acceptée',
      'ASSIGNED_TO_DELIVERY': 'Assignée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée',
      'REPORTED': 'Signalée',
      'REJECTED': 'Rejetée',
    }
    return statusMap[status] || status
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleAcceptOrder = async () => {
    if (!order) return

    try {
      setActionLoading(true)
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }
      const orderId = Number.parseInt(Array.isArray(id) ? id[0] : id, 10)
      const response = await apiAcceptOrder(token, orderId)
      
      // Update order status locally
      setOrder({ ...order, status: "ASSIGNED_TO_DELIVERY" as OrderStatus })
      
      Alert.alert("Succès", "Commande acceptée avec succès", [
        { text: "OK" }
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Échec de l\'acceptation de la commande'
      Alert.alert("Erreur", errorMessage)
      console.error('Error accepting order:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenStatusModal = () => {
    setStatusModal({
      visible: true,
      selectedStatus: null,
      reason: "",
      commonReason: "",
    })
  }

  const handleCloseStatusModal = () => {
    setStatusModal({
      visible: false,
      selectedStatus: null,
      reason: "",
      commonReason: "",
    })
  }

  const handleStatusChange = (status: "REPORTED" | "REJECTED" | "CANCELLED" | "DELIVERED") => {
    // When status changes, clear reason if switching to DELIVERED
    setStatusModal({
      ...statusModal,
      selectedStatus: status,
      reason: status === "DELIVERED" ? "" : statusModal.reason,
      commonReason: status === "DELIVERED" ? "" : statusModal.commonReason,
    })
  }

  const handleCommonReasonChange = (reason: string) => {
    // When selecting a common reason, pre-fill it but allow editing
    // If "Other" is selected, keep current reason or clear if empty
    setStatusModal({
      ...statusModal,
      commonReason: reason,
      reason: reason === "Other" ? (statusModal.reason || "") : reason,
    })
  }

  const handleReasonChange = (reason: string) => {
    setStatusModal({ ...statusModal, reason })
  }

  const canSubmitStatusUpdate = () => {
    if (!statusModal.selectedStatus) return false
    if (statusModal.selectedStatus === "DELIVERED") return true
    
    // For REPORTED, REJECTED, CANCELLED - require reason
    const hasReason = statusModal.reason.trim().length > 0 || 
                     (statusModal.commonReason && statusModal.commonReason !== "Other")
    return hasReason
  }

  const handleSubmitStatusUpdate = async () => {
    if (!order || !statusModal.selectedStatus) return

    if (!canSubmitStatusUpdate()) {
      Alert.alert("Erreur", "Veuillez sélectionner un statut et fournir une raison si nécessaire")
      return
    }

    try {
      setActionLoading(true)
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }
      const orderId = Number.parseInt(Array.isArray(id) ? id[0] : id, 10)
      
      const updateData: UpdateOrderStatusRequest = {
        status: statusModal.selectedStatus,
      }

      // Always include reason for REPORTED, REJECTED, CANCELLED
      if (statusModal.selectedStatus !== "DELIVERED") {
        if (statusModal.reason && statusModal.reason.trim()) {
          updateData.reason = statusModal.reason.trim()
        } else {
          // Fallback to common reason if custom reason is empty
          if (statusModal.commonReason && statusModal.commonReason !== "Other") {
            updateData.reason = statusModal.commonReason
          }
        }
      }

      console.log('Updating order status with data:', updateData)
      const response = await apiUpdateOrderStatus(token, orderId, updateData)
      
      // Refresh order details
      await fetchOrderDetails()
      
      handleCloseStatusModal()
      
      Alert.alert("Succès", `Statut de la commande mis à jour : ${getStatusLabel(response.order.status)}`, [
        { text: "OK" }
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Échec de la mise à jour du statut'
      Alert.alert("Erreur", errorMessage)
      console.error('Error updating order status:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const isFinalStatus = (status: string) => {
    return ["REJECTED", "CANCELLED", "DELIVERED"].includes(status)
  }

  const canAcceptOrder = () => {
    return order?.status === "ACCEPTED"
  }

  const canUpdateStatus = () => {
    return order?.status === "ASSIGNED_TO_DELIVERY"
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f8fd5" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#dc3545" />
          <Text style={styles.errorText}>{error || 'Commande introuvable'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
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
              <Text style={styles.orderId}>{order.orderCode}</Text>
              <Text style={styles.statusLabel}>{getStatusLabel(order.status)}</Text>
            </View>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons name="truck-fast" size={28} color="#0f8fd5" />
            </View>
          </View>
          {order.deliveredAt && (
            <View style={styles.deliveryInfo}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.deliveryTime}>Livrée le : {formatDate(order.deliveredAt)}</Text>
            </View>
          )}
          {!order.deliveredAt && (
            <View style={styles.deliveryInfo}>
              <MaterialCommunityIcons name="clock" size={16} color="#0f8fd5" />
              <Text style={styles.deliveryTime}>Créée le : {formatDate(order.createdAt)}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations client</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={18} color="#0f8fd5" />
            <Text style={styles.infoText}>{order.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone" size={18} color="#0f8fd5" />
            <Text style={styles.infoText}>{order.customerPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#0f8fd5" />
            <View style={styles.addressContainer}>
              <Text style={styles.infoText}>{order.address}</Text>
              <Text style={styles.cityText}>{order.city}</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Récapitulatif de la commande</Text>
          {order.orderItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              {item.product.image && (
                <Image source={{ uri: item.product.image }} style={styles.productImage} />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemQuantity}>Qté : {item.quantity}</Text>
                {item.product.sku && (
                  <Text style={styles.itemSku}>SKU: {item.product.sku}</Text>
                )}
              </View>
              
            </View>
          ))}
          <View style={styles.divider} />
          {order.originalTotalPrice && order.originalTotalPrice !== order.totalPrice && (
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Prix original</Text>
              <Text style={styles.originalPrice}>MAD{order.originalTotalPrice.toFixed(2)}</Text>
            </View>
          )}
          {order.totalDiscount && order.totalDiscount > 0 && (
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Réduction</Text>
              <Text style={styles.discountValue}>-MAD{order.totalDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>MAD{order.totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <MaterialCommunityIcons name="credit-card" size={16} color="#666" />
            <Text style={styles.paymentMethod}>Méthode de paiement : {order.paymentMethod}</Text>
          </View>
        </View>

        {/* Instructions */}
        {order.note && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Instructions de livraison</Text>
            <View style={styles.instructionBox}>
              <MaterialCommunityIcons name="information" size={16} color="#0f8fd5" />
              <Text style={styles.instructionText}>{order.note}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {canAcceptOrder() && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptOrder}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Accepter la commande</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {canUpdateStatus() && !isFinalStatus(order.status) && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.updateStatusButton]}
              onPress={handleOpenStatusModal}
              disabled={actionLoading}
            >
              <MaterialCommunityIcons name="update" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Mettre à jour le statut</Text>
            </TouchableOpacity>
          </View>
        )}

        {isFinalStatus(order.status) && (
          <View style={styles.finalStatusCard}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#28a745" />
            <Text style={styles.finalStatusText}>
              Cette commande est terminée ({getStatusLabel(order.status)})
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal - Centered */}
      <Modal visible={statusModal.visible} transparent animationType="fade">
        <View style={styles.centeredModalOverlay}>
          <View style={styles.centeredModalContent}>
            <View style={styles.centeredModalHeader}>
              <Text style={styles.centeredModalTitle}>Mettre à jour le statut</Text>
              <TouchableOpacity onPress={handleCloseStatusModal}>
                <MaterialCommunityIcons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.centeredModalBody} showsVerticalScrollIndicator={false}>
              {/* Status Selector */}
              <Text style={styles.modalSectionTitle}>Sélectionner le statut</Text>
              <View style={styles.statusSelector}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    statusModal.selectedStatus === "REPORTED" && styles.statusOptionSelected,
                  ]}
                  onPress={() => handleStatusChange("REPORTED")}
                >
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={20}
                    color={statusModal.selectedStatus === "REPORTED" ? "#FFFFFF" : "#666"}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      statusModal.selectedStatus === "REPORTED" && styles.statusOptionTextSelected,
                    ]}
                  >
                    Signalée
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    statusModal.selectedStatus === "REJECTED" && styles.statusOptionSelected,
                  ]}
                  onPress={() => handleStatusChange("REJECTED")}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={statusModal.selectedStatus === "REJECTED" ? "#FFFFFF" : "#666"}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      statusModal.selectedStatus === "REJECTED" && styles.statusOptionTextSelected,
                    ]}
                  >
                    Rejetée
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    statusModal.selectedStatus === "CANCELLED" && styles.statusOptionSelected,
                  ]}
                  onPress={() => handleStatusChange("CANCELLED")}
                >
                  <MaterialCommunityIcons
                    name="cancel"
                    size={20}
                    color={statusModal.selectedStatus === "CANCELLED" ? "#FFFFFF" : "#666"}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      statusModal.selectedStatus === "CANCELLED" && styles.statusOptionTextSelected,
                    ]}
                  >
                    Annulée
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    statusModal.selectedStatus === "DELIVERED" && styles.statusOptionSelected,
                  ]}
                  onPress={() => handleStatusChange("DELIVERED")}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={statusModal.selectedStatus === "DELIVERED" ? "#FFFFFF" : "#666"}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      statusModal.selectedStatus === "DELIVERED" && styles.statusOptionTextSelected,
                    ]}
                  >
                    Livrée
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Reason Section - Only for REPORTED, REJECTED, CANCELLED */}
              {statusModal.selectedStatus &&
                statusModal.selectedStatus !== "DELIVERED" && (
                  <View style={styles.reasonSection}>
                    <Text style={styles.modalSectionTitle}>Raison (requis)</Text>
                    
                    {/* Common Reasons Dropdown */}
                    <View style={styles.commonReasonsContainer}>
                      {COMMON_REASONS.map((reason) => (
                        <TouchableOpacity
                          key={reason}
                          style={[
                            styles.commonReasonButton,
                            statusModal.commonReason === reason && styles.commonReasonButtonSelected,
                          ]}
                          onPress={() => handleCommonReasonChange(reason)}
                        >
                          <Text
                            style={[
                              styles.commonReasonText,
                              statusModal.commonReason === reason && styles.commonReasonTextSelected,
                            ]}
                          >
                            {reason}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Custom Reason Input - Always editable */}
                    <Text style={styles.reasonInputLabel}>
                      {statusModal.commonReason && statusModal.commonReason !== "Other"
                        ? "Vous pouvez modifier la raison ci-dessous :"
                        : "Entrer la raison :"}
                    </Text>
                    <TextInput
                      style={styles.reasonInput}
                      placeholder={
                        statusModal.commonReason === "Other"
                          ? "Entrer votre raison personnalisée..."
                          : "Vous pouvez modifier ou ajouter des détails..."
                      }
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={4}
                      value={statusModal.reason}
                      onChangeText={handleReasonChange}
                      textAlignVertical="top"
                    />
                  </View>
                )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.centeredModalFooter}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={handleCloseStatusModal}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButtonSubmit,
                  (!canSubmitStatusUpdate() || actionLoading) && styles.modalButtonSubmitDisabled,
                ]}
                onPress={handleSubmitStatusUpdate}
                disabled={!canSubmitStatusUpdate() || actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonTextSubmit}>Confirmer</Text>
                )}
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
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centeredModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  centeredModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  centeredModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  centeredModalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 400,
  },
  centeredModalFooter: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
    marginTop: 8,
  },
  statusSelector: {
    gap: 10,
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#F9F9F9",
    gap: 12,
  },
  statusOptionSelected: {
    borderColor: "#0f8fd5",
    backgroundColor: "#0f8fd5",
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  statusOptionTextSelected: {
    color: "#FFFFFF",
  },
  reasonSection: {
    marginTop: 8,
  },
  commonReasonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  commonReasonButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  commonReasonButtonSelected: {
    backgroundColor: "#0f8fd5",
    borderColor: "#0f8fd5",
  },
  commonReasonText: {
    fontSize: 13,
    color: "#666",
  },
  commonReasonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  updateStatusButton: {
    backgroundColor: "#0f8fd5",
  },
  finalStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  finalStatusText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#28a745",
  },
  modalButtonSubmitDisabled: {
    opacity: 0.5,
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
  reasonInputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
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
    minHeight: 100,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0f8fd5",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  addressContainer: {
    flex: 1,
  },
  cityText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F0F0F0",
  },
  itemSku: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  discountLabel: {
    fontSize: 14,
    color: "#666",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },
  discountValue: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "600",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    gap: 8,
  },
  paymentMethod: {
    fontSize: 13,
    color: "#666",
  },
})

export default OrderDetailsScreen
