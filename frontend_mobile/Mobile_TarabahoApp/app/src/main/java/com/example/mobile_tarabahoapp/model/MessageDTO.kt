package com.example.mobile_tarabahoapp.model

data class MessageDTO(
    val id: Long,
    val bookingId: Long,
    val senderUserId: Long?,    // nullable because sender might be user or worker
    val senderWorkerId: Long?,
    val senderName: String,
    val content: String,
    val sentAt: String          // Use String or LocalDateTime depending on your parsing preference
)
