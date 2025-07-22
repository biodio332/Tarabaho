package com.example.mobile_tarabahoapp.model

import com.google.gson.annotations.SerializedName

data class Booking(
    val id: Long,
    val user: User?,
    val worker: Worker?,
    val category: Category,
    val type: String,
    val status: String,
    val paymentMethod: String,
    val paymentConfirmationStatus: String?,
    val amount: Double?,
    val latitude: Double?,
    val longitude: Double?,
    val radius: Double?,
    val createdAt: String,
    val updatedAt: String?,
    val jobDetails: String?
)